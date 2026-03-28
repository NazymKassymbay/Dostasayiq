from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import Message
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer, MessageSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'message': 'Logged out'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            user = request.user
        return Response(UserSerializer(user).data)

    def patch(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_list_view(request):
    users = User.objects.select_related('profile').all()
    return Response(UserSerializer(users, many=True).data)


class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        if username:
            try:
                other = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
            msgs = Message.objects.filter(
                (Q(sender=request.user) & Q(receiver=other)) |
                (Q(sender=other) & Q(receiver=request.user))
            ).order_by('created_at')
            # mark as read
            msgs.filter(receiver=request.user, is_read=False).update(is_read=True)
            return Response(MessageSerializer(msgs, many=True).data)
        else:
            # get conversations list
            sent = Message.objects.filter(sender=request.user).values_list('receiver', flat=True)
            received = Message.objects.filter(receiver=request.user).values_list('sender', flat=True)
            user_ids = set(list(sent) + list(received))
            convos = []
            for uid in user_ids:
                try:
                    u = User.objects.get(pk=uid)
                    last_msg = Message.objects.filter(
                        (Q(sender=request.user) & Q(receiver=u)) |
                        (Q(sender=u) & Q(receiver=request.user))
                    ).last()
                    unread = Message.objects.filter(sender=u, receiver=request.user, is_read=False).count()
                    convos.append({
                        'username': u.username,
                        'last_message': last_msg.content if last_msg else '',
                        'last_time': last_msg.created_at if last_msg else None,
                        'unread': unread,
                        'avatar_color': u.profile.avatar_color if hasattr(u, 'profile') else '#6366f1',
                    })
                except Exception:
                    pass
            convos.sort(key=lambda x: x['last_time'] or '', reverse=True)
            return Response(convos)

    def post(self, request, username=None):
        if not username:
            return Response({'error': 'Username required'}, status=400)
        try:
            receiver = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Content required'}, status=400)
        msg = Message.objects.create(sender=request.user, receiver=receiver, content=content)
        return Response(MessageSerializer(msg).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count_view(request):
    count = Message.objects.filter(receiver=request.user, is_read=False).count()
    return Response({'unread': count})
