"""
Módulo para login persistente sin caída de sesión
Este archivo proporciona un endpoint alternativo de login con sesiones extendidas (7 días)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db, bcrypt
from app.models import User
from app.jwt_config import get_extended_expires_delta
from datetime import timedelta

# Blueprint para login persistente
persistent_login_bp = Blueprint('persistent_auth', __name__, url_prefix='/auth')


@persistent_login_bp.route('/login-persistent', methods=['POST'])
def login_persistent():
    """
    Endpoint de login CON SESIÓN PERSISTENTE (7 días sin caída)
    
    Usa este endpoint en lugar del /user/login si quieres que la sesión nunca se caiga
    
    JSON esperado:
    {
        "email": "admin@example.com",
        "password": "contraseña"
    }
    
    Respuestas:
    - 200: Login exitoso, retorna access_token válido por 7 días
    - 404: Email no registrado
    - 401: Contraseña incorrecta
    - 500: Error del servidor
    """
    try:
        email = request.json.get('email')
        password = request.json.get('password')
        
        print(f"=== LOGIN PERSISTENTE ATTEMPT ===")
        print(f"Email: {email}")
        print(f"Password received: {'Yes' if password else 'No'}")

        if not email or not password:
            print("ERROR: Email or password missing")
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        # Buscar usuario
        login_user = User.query.filter_by(email=email).first()
        print(f"User found in DB: {'Yes' if login_user else 'No'}")

        if not login_user:
            print("ERROR: User not found")
            return jsonify({'error': 'El email proporcionado no corresponde a ninguno registrado'}), 404

        # Verificar contraseña
        password_from_db = login_user.password
        print(f"Password hash from DB: {password_from_db[:20]}...")
        
        password_match = bcrypt.check_password_hash(password_from_db, password)
        print(f"Password verification result: {password_match}")
        
        if password_match:
            # IMPORTANTE: Usar duración EXTENDIDA (7 días sin caída)
            expires = get_extended_expires_delta()  # !IMPORTANT
            
            user_id = login_user.id
            role = login_user.role
            additional_claims = {"role": role}

            access_token = create_access_token(
                identity=str(user_id),
                additional_claims=additional_claims,
                expires_delta=expires
            )

            print(f"LOGIN PERSISTENTE SUCCESS for user {user_id}")
            print(f"Token expires in: {expires.days} days")
            
            return jsonify({
                'access_token': access_token,
                'role': role,
                'user_id': user_id,
                'expires_in_days': expires.days
            }), 200

        else:
            print("ERROR: Password incorrect")
            return jsonify({"error": "Contraseña incorrecta"}), 401
    
    except Exception as e:
        print(f"EXCEPCIÓN en login persistente: {str(e)}")
        import traceback
        print(f"Traceback completo: {traceback.format_exc()}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
