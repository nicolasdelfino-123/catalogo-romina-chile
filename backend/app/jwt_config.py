"""
Módulo de configuración JWT con persistencia de sesión extendida
Archivo independiente para gestionar tokens con mayor duración
"""

from datetime import timedelta
import os

# IMPORTANTE: Estos valores pueden ser sobrescritos por variables de entorno
# Esto asegura que la sesión no se caiga en 30 minutos como antes

# Duración del token de acceso
# Por defecto: 7 días (máxima persistencia)
# Puedes cambiar esto según tus necesidades
JWT_ACCESS_TOKEN_EXPIRES = timedelta(
    days=int(os.getenv("JWT_ACCESS_TOKEN_DAYS", 7))
)

# Duración del token de refresco (si lo usas)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(
    days=int(os.getenv("JWT_REFRESH_TOKEN_DAYS", 30))
)

# Algoritmo de firmado
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def get_jwt_expires_delta():
    """
    Obtiene la duración del token para crear_access_token()
    
    Retorna: timedelta con la duración configurada
    """
    return JWT_ACCESS_TOKEN_EXPIRES

def get_extended_expires_delta():
    """
    Obtiene una duración EXTENDIDA para sessions críticas
    Usa esto cuando quieras que nunca se caiga la sesión
    
    Retorna: timedelta con 30 días de duración (!IMPORTANT)
    """
    return timedelta(days=30)
