"""
Módulo para cambiar contraseña de usuario autenticado
Archivo completamente independiente para cambio de contraseña
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import User

# Blueprint independiente para cambio de contraseña
password_bp = Blueprint('password', __name__, url_prefix='/auth')



@password_bp.route('/change-password', methods=['POST'])
def change_password():
    """
    Permite cambiar la contraseña sin estar logueado.
    JSON esperado:
    {
        "email": "usuario@dominio.com",
        "currentPassword": "contraseña_actual",
        "newPassword": "nueva_contraseña"
    }
    """
    try:
        data = request.get_json()
        email = data.get('email')
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')

        if not email or not current_password or not new_password:
            return jsonify({'error': 'Email, contraseña actual y nueva son requeridas'}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        if current_password == new_password:
            return jsonify({'error': 'La nueva contraseña debe ser diferente a la actual'}), 400

        if not bcrypt.check_password_hash(user.password, current_password):
            return jsonify({'error': 'Contraseña actual incorrecta'}), 400

        new_password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = new_password_hash
        db.session.commit()

        return jsonify({
            'message': 'Contraseña actualizada exitosamente',
            'success': True
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al cambiar contraseña: {str(e)}'}), 500
