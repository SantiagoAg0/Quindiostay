#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de 02_datos.sql para QuindioStay (Entrega 3).
Determinista salvo los hashes BCrypt (cada ejecución usa un salt distinto).
Uso:  python3 generar_datos.py > 02_datos.sql
Requiere: pip install bcrypt   (solo para cifrar las contrasenas de ejemplo)
"""
import random, sys, unicodedata, datetime as dt
from decimal import Decimal
from collections import defaultdict
import bcrypt

random.seed(2026_11)
HOY = dt.date(2026, 11, 11)          # fecha de "hoy" para los datos (fecha de la entrega)
D = dt.date


def q(v):
    """Literal SQL."""
    if v is None:
        return 'NULL'
    if isinstance(v, (int, Decimal)):
        return str(v)
    if isinstance(v, float):
        return repr(v)
    if isinstance(v, dt.datetime):
        return "'" + v.strftime('%Y-%m-%d %H:%M:%S') + "'"
    if isinstance(v, dt.date):
        return "'" + v.isoformat() + "'"
    if isinstance(v, dt.time):
        return "'" + v.strftime('%H:%M:%S') + "'"
    return "'" + str(v).replace("\\", "\\\\").replace("'", "''") + "'"


def sin_tildes(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def pick(items, weights=None):
    return random.choices(items, weights=weights, k=1)[0]


def bhash(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt(rounds=10, prefix=b'2a')).decode()


# ------------------------------------------------------------------ catalogos
MUNICIPIOS = [('Armenia', '63001'), ('Buenavista', '63111'), ('Calarcá', '63130'), ('Circasia', '63190'),
              ('Córdoba', '63212'), ('Filandia', '63272'), ('Génova', '63302'), ('La Tebaida', '63401'),
              ('Montenegro', '63470'), ('Pijao', '63548'), ('Quimbaya', '63594'), ('Salento', '63690')]
MUN = {n: i + 1 for i, (n, _) in enumerate(MUNICIPIOS)}

TIPOS = ['ALOJAMIENTO', 'AGENCIA_VIAJES', 'TRANSPORTE', 'GASTRONOMIA', 'GUIANZA', 'ALQUILER_VEHICULOS', 'ATRACCION', 'OTROS']
TIPO = {n: i + 1 for i, n in enumerate(TIPOS)}
ROLES = ['ADMINISTRADOR_PLATAFORMA', 'ENCARGADO_PRESTADOR', 'OPERADOR']
CATEGORIAS = [('CULTURAL', 'Patrimonio histórico, arquitectura, museos y tradiciones del Paisaje Cultural Cafetero'),
              ('AVENTURA', 'Senderismo exigente, cabalgatas, canopy, ciclomontañismo y deportes de aventura'),
              ('NATURALEZA', 'Valles de palma de cera, bosques de niebla, observación de aves y flora nativa'),
              ('CAFETERO', 'Experiencias de finca: recolección, beneficio, cata y gastronomía cafetera')]
CAT = {n: i + 1 for i, (n, _) in enumerate(CATEGORIAS)}
IDIOMAS = ['ESPAÑOL', 'INGLES', 'FRANCES', 'ALEMAN', 'PORTUGUES']
IDI = {n: i + 1 for i, n in enumerate(IDIOMAS)}

# ------------------------------------------------------------------ prestadores
# (clave, nombre, tipo, municipio, estado, direccion, es_de_tours)
PRESTADORES = [
    ('hacienda', 'Hacienda Cafetera La Samaria', 'ALOJAMIENTO', 'Salento', 'ACTIVO', 'Vereda Boquía, km 4 vía Salento', False),
    ('boutique', 'Hotel Boutique Casa Quimbaya', 'ALOJAMIENTO', 'Quimbaya', 'ACTIVO', 'Carrera 7 # 15-32', False),
    ('cabanas', 'Cabañas Mirador del Cocora', 'ALOJAMIENTO', 'Salento', 'ACTIVO', 'Vereda Cocora, vía al Valle', False),
    ('finca', 'Finca Hotel El Paraíso Cafetero', 'ALOJAMIENTO', 'Montenegro', 'SUSPENDIDO', 'Vereda Pueblo Tapao, finca 12', False),
    ('hostal', 'Hostal Plaza de Bolívar', 'ALOJAMIENTO', 'Armenia', 'RETIRADO', 'Calle 20 # 14-45', False),
    ('viajescafe', 'Café y Montaña Tours Guiados SAS', 'GUIANZA', 'Armenia', 'ACTIVO', 'Carrera 14 # 17-80, local 203', True),
    ('quindioexp', 'Quindío Experiencias Guiadas SAS', 'GUIANZA', 'Armenia', 'ACTIVO', 'Avenida Bolívar # 12N-31', True),
    ('paisaje', 'Paisaje Cultural Tours', 'AGENCIA_VIAJES', 'Calarcá', 'ACTIVO', 'Carrera 25 # 38-10', False),
    ('jeep', 'Transportes Jeep Willys Cocora', 'TRANSPORTE', 'Salento', 'ACTIVO', 'Plaza Principal, Carrera 6 # 5-02', False),
    ('traslados', 'Turismo y Traslados Eje Cafetero', 'TRANSPORTE', 'Armenia', 'SUSPENDIDO', 'Calle 21 # 19-18', False),
    ('trucha', 'Restaurante Trucha del Quindío', 'GASTRONOMIA', 'Salento', 'ACTIVO', 'Calle 5 # 3-24', False),
    ('fonda', 'Fonda Paisa La Tebaida', 'GASTRONOMIA', 'La Tebaida', 'ACTIVO', 'Carrera 9 # 11-40', False),
    ('maiz', 'Café-Restaurante Casa del Maíz', 'GASTRONOMIA', 'Filandia', 'RETIRADO', 'Carrera 6 # 7-15', False),
    ('cocora', 'Guías del Valle de Cocora', 'GUIANZA', 'Salento', 'ACTIVO', 'Calle 3 # 4-11', True),
    ('rutas', 'Rutas Verdes Quindío', 'GUIANZA', 'Armenia', 'ACTIVO', 'Carrera 16 # 23-27', True),
    ('aves', 'Aves y Montaña Ecoturismo', 'GUIANZA', 'Circasia', 'ACTIVO', 'Carrera 14 # 9-05', True),
    ('auto', 'AutoQuindío Alquiler de Vehículos', 'ALQUILER_VEHICULOS', 'Armenia', 'ACTIVO', 'Avenida Centenario # 15-60', False),
    ('parque', 'Parque Temático Cafetero Montenegro', 'ATRACCION', 'Montenegro', 'ACTIVO', 'Kilómetro 6 vía Montenegro–Quimbaya', False),
    ('jardin', 'Jardín Botánico y Mariposario Calarcá', 'ATRACCION', 'Calarcá', 'ACTIVO', 'Kilómetro 3 vía Calarcá–Armenia', False),
    ('termales', 'Termales y Spa Pijao Natural', 'OTROS', 'Pijao', 'ACTIVO', 'Vereda La Mina, camino a la cascada', False),
]
PK = {p[0]: i + 1 for i, p in enumerate(PRESTADORES)}
PINFO = {p[0]: p for p in PRESTADORES}


def nit_dv(n):
    w = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
    s = sum(int(d) * w[i] for i, d in enumerate(reversed(str(n))))
    r = s % 11
    return r if r < 2 else 11 - r


def telefono():
    return '3' + pick(['00', '01', '04', '05', '10', '15', '16', '17', '20', '24', '50']) + ''.join(random.choice('0123456789') for _ in range(7))


prest_rows = []
nits = set()
for i, (k, nombre, tipo, mun, estado, dire, _) in enumerate(PRESTADORES, 1):
    while True:
        base = random.randint(800_000_000, 901_999_999)
        if base not in nits:
            nits.add(base)
            break
    slug = sin_tildes(nombre).lower().replace('-', ' ')
    slug = ''.join(c for c in slug if c.isalnum() or c == ' ').split()
    slug = ''.join(slug[:2]) if len(slug) > 1 else slug[0]
    correo = f"{pick(['info', 'reservas', 'contacto'])}@{slug}.com.co"
    prest_rows.append((i, nombre, f'{base}-{nit_dv(base)}', 'RNT-' + str(random.randint(10000, 99999)),
                       f'{dire}', telefono(), correo, estado, MUN[mun], TIPO[tipo]))
# direccion con municipio no se repite en columna; se deja la calle

# ------------------------------------------------------------------ usuarios del sistema
USUARIOS = [
    ('admin', 'Admin123*', 'ACTIVO', 'ADMINISTRADOR_PLATAFORMA', None),
    ('operador', 'Operador123*', 'ACTIVO', 'OPERADOR', None),
    ('operador2', 'Operador123*', 'ACTIVO', 'OPERADOR', None),
    ('enc_cocora', 'Encargado123*', 'ACTIVO', 'ENCARGADO_PRESTADOR', 'cocora'),
    ('enc_viajescafe', 'Encargado123*', 'ACTIVO', 'ENCARGADO_PRESTADOR', 'viajescafe'),
    ('enc_rutas', 'Encargado123*', 'ACTIVO', 'ENCARGADO_PRESTADOR', 'rutas'),
    ('enc_quindioexp', 'Encargado123*', 'ACTIVO', 'ENCARGADO_PRESTADOR', 'quindioexp'),
    ('enc_aves', 'Encargado123*', 'BLOQUEADO', 'ENCARGADO_PRESTADOR', 'aves'),
]
usuario_rows = []
for i, (u, pw, est, rol, prest) in enumerate(USUARIOS, 1):
    usuario_rows.append((i, u, bhash(pw), est, ROLES.index(rol) + 1, PK[prest] if prest else None))

# ------------------------------------------------------------------ clientes
NOM_F = ['María', 'Luisa', 'Camila', 'Valentina', 'Paula', 'Daniela', 'Andrea', 'Carolina', 'Natalia', 'Laura', 'Juliana', 'Sofía',
         'Diana', 'Marcela', 'Catalina', 'Mariana', 'Alejandra', 'Isabella', 'Sara', 'Verónica', 'Lina', 'Johana', 'Yuliana', 'Tatiana', 'Gloria', 'Ángela']
NOM_M = ['Juan', 'Carlos', 'Andrés', 'Santiago', 'Sebastián', 'Camilo', 'Daniel', 'Felipe', 'David', 'Julián', 'Mateo', 'Jorge', 'Luis',
         'Miguel', 'Alejandro', 'Esteban', 'Nicolás', 'Diego', 'Jhon', 'Cristian', 'Óscar', 'Hernán', 'Fabián', 'Ricardo', 'Mauricio', 'Iván']
APELL = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Ramírez', 'Torres', 'Díaz', 'Vargas', 'Castro', 'Moreno',
         'Jiménez', 'Ruiz', 'Gómez', 'Ospina', 'Giraldo', 'Cardona', 'Montoya', 'Arias', 'Salazar', 'Quintero', 'Zapata', 'Valencia',
         'Duque', 'Franco', 'Restrepo', 'Henao', 'Rojas', 'Parra', 'Pineda', 'Cortés', 'Mejía', 'Londoño', 'Aguirre', 'Osorio', 'Betancur',
         'Marín', 'Patiño', 'Bedoya', 'Soto', 'Cruz', 'Peña', 'Acosta', 'Sánchez', 'Muñoz', 'Agudelo', 'Gaviria', 'Echeverri', 'Ríos']
EXTR = [('Emily', 'Johnson', 'Miami'), ('Lucas', 'Müller', 'Berlín'), ('Camille', 'Dubois', 'París'), ('Carlos', 'Fernández', 'Madrid'),
        ('Sofía', 'Álvarez', 'Buenos Aires'), ('Pedro', 'Almeida', 'São Paulo'), ('Michael', 'Brown', 'Houston'),
        ('Ana', 'Lima', 'Lisboa'), ('Jorge', 'Ramos', 'Ciudad de México'), ('Hannah', 'Schmidt', 'Múnich'),
        ('Lucía', 'Paredes', 'Lima'), ('Thomas', 'Wright', 'Londres'), ('Valeria', 'Soto', 'Santiago de Chile'),
        ('Marco', 'Rossi', 'Milán'), ('Jean', 'Lefèvre', 'Lyon')]
CIUDADES = ['Bogotá D.C.', 'Medellín', 'Cali', 'Armenia', 'Pereira', 'Manizales', 'Barranquilla', 'Bucaramanga', 'Ibagué', 'Cartagena',
            'Cúcuta', 'Villavicencio', 'Calarcá', 'Montenegro', 'Neiva', 'Popayán', 'Santa Marta', 'Tuluá', 'Palmira', 'Envigado']
CIU_W = [22, 16, 11, 14, 8, 4, 4, 3, 3, 3, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1]
DOMINIOS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'uniquindio.edu.co', 'icloud.com', 'correo.com.co']
DOM_W = [55, 15, 12, 8, 4, 4, 2]

N_CLIENTES = 150
clientes = []          # dict
docs, correos = set(), set()
n_extr = len(EXTR)
for i in range(1, N_CLIENTES + 1):
    if i <= 11:  # 8 CE + 3 pasaporte (extranjeros, con ciudad del exterior)
        nm, ap, ciu = EXTR[i - 1]
        tdoc = 'PASAPORTE' if i > 8 else 'CE'
        num = ''.join(random.choice('0123456789') for _ in range(7 if tdoc == 'CE' else 9)) if tdoc == 'CE' else random.choice('ABCDEFG') + ''.join(random.choice('0123456789') for _ in range(8))
        nombres, apellidos, ciudad = nm, ap, ciu
        nac = D(random.randint(1960, 2002), random.randint(1, 12), random.randint(1, 28))
        extranjero = True
    else:
        fem = random.random() < 0.52
        nombres = pick(NOM_F if fem else NOM_M)
        if random.random() < 0.3:
            nombres += ' ' + pick(NOM_F if fem else NOM_M)
        apellidos = pick(APELL) + ' ' + pick(APELL)
        ciudad = pick(CIUDADES, CIU_W)
        tdoc = 'CC'
        r = random.random()
        num = str(random.randint(1_000_000_000, 1_109_999_999)) if r < 0.45 else str(random.randint(10_000_000, 99_999_999)) if r < 0.9 else str(random.randint(1_000_000, 9_999_999))
        nac = D(random.randint(1952, 2006), random.randint(1, 12), random.randint(1, 28))
        extranjero = False
    while (tdoc, num) in docs:
        num = str(int(num) + 1) if num.isdigit() else num[:-1] + str((int(num[-1]) + 1) % 10)
    docs.add((tdoc, num))
    base = sin_tildes((nombres.split()[0] + '.' + apellidos.split()[0])).lower().replace(' ', '')
    while True:
        dom = pick(DOMINIOS, DOM_W)
        suf = '' if random.random() < 0.55 else str(random.randint(1, 99)) if random.random() < 0.7 else str(random.randint(70, 2005))
        correo = f'{base}{suf}@{dom}'
        if correo not in correos:
            correos.add(correo)
            break
    clientes.append(dict(id=i, nombres=nombres, apellidos=apellidos, tdoc=tdoc, num=num, correo=correo, tel=telefono(),
                         nac=nac, ciudad=ciudad, extr=extranjero, perfil=None, canal_notif=None))

# perfiles: 110 de 150 (los de mostrador/telefono pueden no tener cuenta)
con_perfil = set(random.sample(range(1, N_CLIENTES + 1), 110))
con_perfil |= set(range(1, 12))
while len(con_perfil) > 112:
    con_perfil.discard(random.choice([x for x in con_perfil if x > 11]))
PW_CLIENTE = bhash('Cliente123*')   # una sola contrasena de ejemplo para todos los clientes (se cifra una vez)
perfil_rows = []
for c in clientes:
    if c['id'] in con_perfil:
        idioma = 'INGLES' if (c['extr'] and random.random() < 0.8) or random.random() < 0.08 else 'ESPAÑOL'
        canal = pick(['CORREO', 'WHATSAPP', 'SMS'], [50, 36, 14])
        antic = pick([1, 3, 7], [25, 45, 30])
        promo = pick(['SI', 'NO'], [60, 40])
        c['perfil'] = dict(antic=antic, promo=promo, canal=canal)
        c['canal_notif'] = canal
        perfil_rows.append((c['id'], PW_CLIENTE if c['id'] % 25 else bhash('Cliente123*'), idioma, canal, antic, promo))
    else:
        c['canal_notif'] = pick(['CORREO', 'SMS', 'WHATSAPP'], [60, 25, 15])

# ------------------------------------------------------------------ guias
GUIAS = [('Hernán Darío Cardona Ospina', ['ESPAÑOL', 'INGLES']),
         ('Luz Marina Arias Quintero', ['ESPAÑOL']),
         ('Jhon Fredy Salazar Giraldo', ['ESPAÑOL', 'INGLES', 'ALEMAN']),
         ('Claudia Patricia Montoya Duque', ['ESPAÑOL', 'FRANCES', 'INGLES']),
         ('Wilmar Andrés Zapata Henao', ['ESPAÑOL']),
         ('Sandra Milena Restrepo Parra', ['ESPAÑOL', 'INGLES']),
         ('Carlos Alberto Valencia Rojas', ['ESPAÑOL', 'PORTUGUES']),
         ('Diana Carolina Pineda Marín', ['ESPAÑOL', 'INGLES']),
         ('Oscar Eduardo Franco Betancur', ['ESPAÑOL']),
         ('Marcela Londoño Patiño', ['ESPAÑOL', 'INGLES', 'FRANCES']),
         ('Everth Gaviria Bedoya', ['ESPAÑOL']),
         ('Katherine Soto Echeverri', ['INGLES', 'ALEMAN'])]
guia_rows, guia_idioma_rows, guia_langs = [], [], {}
for i, (nm, langs) in enumerate(GUIAS, 1):
    doc = str(random.randint(1_088_000_000, 1_098_999_999)) if i % 3 else str(random.randint(18_000_000, 41_999_999))
    guia_rows.append((i, nm, doc, f'TP-QND-{1000 + i * 37:04d}'))
    guia_langs[i] = [IDI[l] for l in langs]
    for l in langs:
        guia_idioma_rows.append((i, IDI[l]))

# ------------------------------------------------------------------ tours
# (nombre, descripcion, horas, dificultad, edad_min, precio, categoria, prestador)
TOURS = [
    ('Valle de Cocora: Palma de Cera y Mirador', 'Caminata por el valle de la palma de cera, cruce de puentes colgantes y ascenso al mirador con vista al bosque de niebla. Incluye guía certificado y seguro.', 5.5, 'MEDIA', 8, 85000, 'NATURALEZA', 'cocora'),
    ('Del Grano a la Taza: Tour del Café', 'Recorrido por una finca cafetera: siembra, recolección, beneficio, secado y tostión, con degustación de tres métodos de preparación.', 3.0, 'BAJA', 0, 70000, 'CAFETERO', 'viajescafe'),
    ('Cabalgata Cafetera por Filandia', 'Cabalgata guiada entre cafetales y guadua hasta el mirador, con parada para café de origen y almojábanas.', 4.0, 'MEDIA', 10, 90000, 'AVENTURA', 'viajescafe'),
    ('Canopy en el Bosque de Niebla', 'Circuito de nueve plataformas y tirolinas sobre bosque nativo con equipo certificado y guías de seguridad.', 2.5, 'MEDIA', 12, 110000, 'AVENTURA', 'rutas'),
    ('Avistamiento de Aves en el Río Navarco', 'Salida de madrugada con binoculares y listado de especies; se espera ver tucanes, colibríes y tángaras endémicas.', 4.0, 'BAJA', 6, 75000, 'NATURALEZA', 'aves'),
    ('Caminata al Cañón del Río Quindío', 'Descenso por sendero técnico hasta el cañón, con cruces de quebrada y baño en pozo natural. Requiere buen estado físico.', 6.0, 'ALTA', 14, 120000, 'AVENTURA', 'rutas'),
    ('Cascada de Santa Rita y Bosque de Guadua', 'Sendero ecológico a la cascada con explicación del ecosistema de guadua y refrigerio campesino.', 3.5, 'MEDIA', 8, 60000, 'NATURALEZA', 'cocora'),
    ('Ruta Patrimonial de Filandia', 'Caminata por el centro histórico, balcones de la Calle del Tiempo Detenido y mirador Colina Iluminada.', 2.5, 'BAJA', 0, 45000, 'CULTURAL', 'quindioexp'),
    ('Museo del Oro Quimbaya y Centro Histórico', 'Visita guiada al museo de orfebrería precolombina y recorrido por la arquitectura republicana de Armenia.', 3.0, 'BAJA', 0, 50000, 'CULTURAL', 'quindioexp'),
    ('Pueblos Patrimonio en Jeep Willys', 'Recorrido en jeep por Circasia y Salento con paradas en miradores y talleres de artesanía.', 5.0, 'BAJA', 0, 95000, 'CULTURAL', 'viajescafe'),
    ('Experiencia Premium: Cata y Tostión', 'Taller de cata SCA y tostión en pequeño lote, con catador profesional y bolsa de café para llevar.', 4.0, 'BAJA', 14, 140000, 'CAFETERO', 'viajescafe'),
    ('Recolección de Café en Temporada de Cosecha', 'Participa en la cosecha junto a las familias caficultoras y aprende a seleccionar el grano maduro.', 3.0, 'MEDIA', 10, 80000, 'CAFETERO', 'cocora'),
    ('Senderismo Reserva Barbas–Bremen', 'Jornada completa por la reserva: bosque andino, humedal y observación de fauna. Se recomienda calzado de montaña.', 6.0, 'ALTA', 14, 105000, 'NATURALEZA', 'aves'),
    ('Ciclomontañismo por el Camino Nacional', 'Ruta en bicicleta de montaña por antiguos caminos de arriería, con bicicleta y casco incluidos.', 5.0, 'ALTA', 16, 130000, 'AVENTURA', 'rutas'),
    ('Orquídeas y Heliconias: Jardín Botánico', 'Recorrido interpretativo por colecciones de orquídeas, heliconias y el mariposario.', 2.5, 'BAJA', 0, 38000, 'NATURALEZA', 'aves'),
    ('Parque Temático Cafetero: Día Completo', 'Entrada al parque con recorrido por el museo del café, teatro de la tradición y atracciones culturales.', 7.0, 'BAJA', 0, 120000, 'CULTURAL', 'quindioexp'),
    ('Pijao Cittaslow: Pueblo Lento y Cafés de Origen', 'Caminata por el primer pueblo Cittaslow de Latinoamérica, con visita a cafés de origen y mirador.', 4.0, 'BAJA', 0, 65000, 'CULTURAL', 'quindioexp'),
    ('Observación de Estrellas en Finca Cafetera', 'Noche de astronomía con telescopios y chocolate caliente en una finca a 1.900 metros.', 2.0, 'BAJA', 6, 55000, 'NATURALEZA', 'cocora'),
    ('Cuatrimotos por Fincas de La Tebaida', 'Recorrido en cuatrimoto por caminos rurales y fincas, con casco, gafas y briefing de seguridad.', 2.0, 'MEDIA', 16, 150000, 'AVENTURA', 'rutas'),
    ('Ruta Gastronómica Cafetera', 'Degustación en tres paradas: trucha, fríjoles con garra y postres de la región, maridados con café.', 3.5, 'BAJA', 0, 68000, 'CAFETERO', 'viajescafe'),
    ('Cacao y Chocolate Artesanal', 'Taller práctico del cacao al chocolate: tostado, molienda y moldeado en una finca agroturística.', 3.0, 'BAJA', 6, 58000, 'CULTURAL', 'viajescafe'),
    ('Parapente sobre el Paisaje Cafetero', 'Vuelo biplaza con piloto certificado desde el mirador; incluye video del vuelo.', 1.5, 'MEDIA', 16, 180000, 'AVENTURA', 'cocora'),
    ('Caminata Nocturna de Luciérnagas y Ranas', 'Sendero nocturno con linterna roja para observar luciérnagas, anfibios e insectos del bosque.', 2.0, 'BAJA', 8, 48000, 'NATURALEZA', 'aves'),
    ('Fotografía al Amanecer en la Palma de Cera', 'Salida de madrugada con fotógrafo guía para capturar la niebla y las palmas; incluye desayuno.', 6.5, 'MEDIA', 12, 125000, 'NATURALEZA', 'cocora'),
]
tour_rows = [(i, n, d, Decimal(str(h)), dif, em, Decimal(p), CAT[c], PK[pr]) for i, (n, d, h, dif, em, p, c, pr) in enumerate(TOURS, 1)]
TOUR = {r[0]: dict(id=r[0], nombre=r[1], horas=float(r[3]), dif=r[4], edad_min=r[5], precio=int(r[6]), prest=r[8]) for r in tour_rows}
TOUR_POP = [10, 9, 6, 6, 5, 4, 5, 5, 4, 6, 4, 3, 3, 3, 3, 4, 3, 3, 3, 4, 3, 2, 2, 3]

# ------------------------------------------------------------------ planes
PLAN_TPL = {
    'ALOJAMIENTO': [('Noche en cabaña con desayuno típico', 'Una noche de alojamiento con desayuno cafetero, wifi y parqueadero.', 'BASICO', 180000, 420000),
                    ('Fin de semana romántico', 'Dos noches con cena a la luz de las velas, botella de vino y late check-out.', 'PREMIUM', 650000, 1100000),
                    ('Plan familiar tres noches', 'Tres noches para cuatro personas, desayunos y una actividad guiada en la finca.', 'ESTANDAR', 520000, 880000),
                    ('Todo incluido en finca hotel', 'Alojamiento, tres comidas, tour del café y actividades dentro de la finca.', 'TODO_INCLUIDO', 750000, 1300000)],
    'AGENCIA_VIAJES': [('Quindío Esencial 2 días', 'Dos días con Valle de Cocora, Filandia y alojamiento con desayuno.', 'BASICO', 380000, 520000),
                       ('Paisaje Cultural Cafetero 3 días', 'Tres días entre fincas, pueblos patrimonio y parques temáticos, con transporte interno.', 'ESTANDAR', 690000, 960000),
                       ('Experiencia Premium Eje Cafetero', 'Cuatro días con hotel boutique, guía privado y cata especializada.', 'PREMIUM', 1350000, 1850000),
                       ('Todo incluido 4 días', 'Alojamiento, alimentación completa, transporte y todas las entradas.', 'TODO_INCLUIDO', 1500000, 2200000)],
    'TRANSPORTE': [('Traslado aeropuerto Armenia–Salento', 'Traslado privado en van para hasta cuatro personas.', 'BASICO', 120000, 160000),
                   ('Transporte en jeep por fincas', 'Jeep Willys con conductor por seis horas, con paradas en miradores.', 'ESTANDAR', 280000, 360000),
                   ('Tour privado en van con conductor', 'Día completo con conductor y combustible incluidos.', 'PREMIUM', 480000, 650000)],
    'GASTRONOMIA': [('Menú típico quindiano', 'Bandeja o trucha, bebida y postre de la casa.', 'BASICO', 38000, 62000),
                    ('Experiencia de trucha y café', 'Entrada, plato fuerte de trucha, postre y cata de café.', 'ESTANDAR', 75000, 98000),
                    ('Cena maridaje de café', 'Cuatro tiempos maridados con café de origen y cacao local.', 'PREMIUM', 140000, 190000)],
    'GUIANZA': [('Guianza privada medio día', 'Guía bilingüe por cuatro horas con transporte local.', 'BASICO', 160000, 240000),
                ('Guianza privada día completo', 'Guía por ocho horas, almuerzo campesino y seguro.', 'ESTANDAR', 280000, 380000),
                ('Expedición fotográfica y de aves', 'Guía naturalista especializado, equipo óptico y desayuno.', 'PREMIUM', 390000, 520000)],
    'ALQUILER_VEHICULOS': [('Alquiler de moto por día', 'Moto 125 cc con casco y seguro obligatorio.', 'BASICO', 90000, 130000),
                           ('Camioneta 4x4 tres días', 'Camioneta con kilometraje libre y seguro todo riesgo.', 'ESTANDAR', 690000, 880000),
                           ('Cuatrimoto por jornada', 'Cuatrimoto con inducción y ruta guiada por fincas.', 'PREMIUM', 210000, 290000)],
    'ATRACCION': [('Entrada general', 'Ingreso al parque con acceso a exhibiciones y espectáculos.', 'BASICO', 38000, 72000),
                  ('Pasaporte todo incluido', 'Acceso a todas las atracciones, almuerzo y souvenir.', 'TODO_INCLUIDO', 115000, 168000),
                  ('Recorrido guiado preferencial', 'Ingreso sin filas con guía y refrigerio.', 'ESTANDAR', 78000, 110000)],
    'OTROS': [('Circuito de termales y spa', 'Ingreso a piscinas termales, masaje de 30 minutos y almuerzo.', 'ESTANDAR', 140000, 220000),
              ('Día de relajación completo', 'Termales, masaje, tratamiento facial y almuerzo saludable.', 'PREMIUM', 260000, 380000),
              ('Entrada a termales', 'Ingreso por jornada a las piscinas termales.', 'BASICO', 48000, 70000)],
}
# cuantos planes por prestador (40 en total)
PLANES_POR = {'cocora': 3, 'viajescafe': 3, 'rutas': 3, 'quindioexp': 2, 'aves': 2, 'parque': 1, 'jardin': 1, 'termales': 1,
              'hacienda': 3, 'boutique': 3, 'cabanas': 3, 'finca': 2, 'hostal': 2, 'paisaje': 2, 'jeep': 2, 'traslados': 1,
              'trucha': 2, 'fonda': 2, 'maiz': 1, 'auto': 1}
assert sum(PLANES_POR.values()) == 40, sum(PLANES_POR.values())
# las guianzas usan las plantillas de GUIANZA; las agencias de tours tambien
plan_rows, PLANES = [], []
pid = 0
for k, n in PLANES_POR.items():
    info = PINFO[k]
    tpls = PLAN_TPL[info[2]]
    for j in range(n):
        nombre, desc, tipo, lo, hi = tpls[j]
        precio = int(round(random.uniform(lo, hi) / 5000) * 5000)
        estado_p = info[4]
        if estado_p == 'RETIRADO':
            ini, fin, est = D(2026, 1, 15), D(2026, 5, 31), 'INACTIVO'
        elif estado_p == 'SUSPENDIDO':
            ini, fin, est = D(2026, 2, 1), D(2026, 8, 31), 'INACTIVO'
        elif k in ('hacienda', 'boutique') and j == 2:      # temporada vieja, ya cerrada
            ini, fin, est = D(2026, 1, 10), D(2026, 6, 30), 'INACTIVO'
        elif k in ('trucha', 'paisaje') and j == 1:
            ini, fin, est = D(2026, 1, 15), D(2026, 6, 30), 'INACTIVO'
        else:
            ini = pick([D(2026, 1, 15), D(2026, 2, 1), D(2026, 3, 1)], [60, 25, 15])
            fin = pick([D(2027, 3, 31), D(2027, 6, 30), D(2027, 12, 31)], [30, 45, 25])
            est = 'ACTIVO'
        pid += 1
        plan_rows.append((pid, nombre, desc, tipo, Decimal(precio), ini, fin, est, PK[k]))
        PLANES.append(dict(id=pid, prest=PK[k], key=k, precio=precio, ini=ini, fin=fin, estado=est))
PLAN = {p['id']: p for p in PLANES}
planes_de = defaultdict(list)
for p in PLANES:
    planes_de[p['prest']].append(p)

# ------------------------------------------------------------------ salidas
def horario_cruza(lst, fecha, h_ini, horas):
    s = h_ini * 60
    e = s + int(horas * 60)
    for (f, a, b) in lst:
        if f == fecha and s < b and a < e:
            return True
    return False

salidas = []
agenda = defaultdict(list)       # id_guia -> [(fecha, ini_min, fin_min)]
N_SAL = 64
fechas_pos = []
d0 = D(2026, 3, 1)
while d0 <= D(2027, 2, 28):
    w = 3.0 if d0.weekday() >= 5 else 1.0
    if d0.month in (12, 1) or (d0.month == 6 and d0.day >= 20):
        w *= 1.4
    fechas_pos.append((d0, w))
    d0 += dt.timedelta(days=1)
salida_id = 0
intentos = 0
while len(salidas) < N_SAL and intentos < 5000:
    intentos += 1
    t = random.choices(range(1, 25), weights=TOUR_POP, k=1)[0]
    tour = TOUR[t]
    fecha = random.choices([f for f, _ in fechas_pos], weights=[w for _, w in fechas_pos], k=1)[0]
    guia = random.randint(1, 12)
    # idioma: casi siempre espanol; si el guia no habla espanol, el suyo
    langs = guia_langs[guia]
    idioma = IDI['ESPAÑOL'] if (IDI['ESPAÑOL'] in langs and random.random() < 0.78) else random.choice(langs)
    hora = pick([6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 13, 14, 16, 19], [3, 2, 4, 3, 5, 3, 3, 2, 3, 2, 1, 1])
    if tour['horas'] >= 5:
        hora = pick([6, 6.5, 7, 7.5, 8])
    if tour['nombre'].startswith(('Observación', 'Caminata Nocturna')):
        hora = 19
    if tour['nombre'].startswith(('Fotografía', 'Avistamiento')):
        hora = pick([5.5, 6])
    h_ini_min = int(hora * 60)
    if horario_cruza(agenda[guia], fecha, hora, tour['horas']) or any(
            s['id_guia'] == guia and s['fecha'] == fecha and s['ini'] == h_ini_min for s in salidas):
        continue
    cupo = pick([8, 10, 12, 15, 16, 20], [14, 22, 28, 14, 14, 8])
    if tour['nombre'].startswith(('Parque', 'Parapente', 'Cuatrimotos')):
        cupo = pick([10, 12, 20, 30], [3, 3, 2, 2]) if tour['nombre'].startswith('Parque') else pick([6, 8], [1, 1])
    if fecha < HOY:
        estado = pick(['REALIZADA', 'CANCELADA'], [90, 10])
    else:
        estado = pick(['PROGRAMADA', 'CANCELADA'], [92, 8])
    salida_id += 1
    agenda[guia].append((fecha, h_ini_min, h_ini_min + int(tour['horas'] * 60)))
    salidas.append(dict(id=salida_id, fecha=fecha, hora=dt.time(int(hora), int(round((hora % 1) * 60))), ini=h_ini_min, cupo=cupo,
                        estado=estado, tour=t, id_guia=guia, idioma=idioma))
assert len(salidas) == N_SAL, len(salidas)
salidas.sort(key=lambda s: (s['fecha'], s['hora']))
for i, s in enumerate(salidas, 1):
    s['id'] = i
SAL = {s['id']: s for s in salidas}

# ------------------------------------------------------------------ reservas
def edad_en(nac, f):
    return f.year - nac.year - ((f.month, f.day) < (nac.month, nac.day))

reservas = []   # dict
participantes = []
clientes_web = [c for c in clientes if c['perfil']]
clientes_all = clientes
RES_PROB_CANCEL = 0.14


def canal_para(c, es_tour):
    if c['perfil']:
        return pick(['WEB', 'APP_MOVIL', 'TELEFONO', 'MOSTRADOR', 'AGENCIA_INTERMEDIARIA'], [34, 30, 8, 8, 20] if es_tour else [30, 22, 12, 22, 14])
    return pick(['TELEFONO', 'MOSTRADOR', 'AGENCIA_INTERMEDIARIA'], [25, 45, 30])


def elegir_cliente():
    # algunos clientes reservan mucho (asimetria): cola larga
    return random.choices(clientes, weights=[1 + (8 if c['id'] % 11 == 0 else 3 if c['id'] % 5 == 0 else 0) for c in clientes], k=1)[0]


def crear_creacion(servicio, plan_ini):
    lead = random.choices([2, 3, 5, 7, 10, 14, 21, 30, 45, 60], weights=[3, 5, 8, 12, 14, 14, 12, 14, 10, 8], k=1)[0]
    cre = min(servicio - dt.timedelta(days=lead), HOY)
    cre = max(cre, plan_ini)
    if cre > servicio - dt.timedelta(days=1):
        cre = servicio - dt.timedelta(days=1) if servicio - dt.timedelta(days=1) >= plan_ini else servicio
    return cre


# --- reservas de tour
NOMBRES_PART_H = NOM_M
NOMBRES_PART_M = NOM_F
for s in salidas:
    tour = TOUR[s['tour']]
    planes_ok = [p for p in planes_de[tour['prest']] if p['estado'] == 'ACTIVO' and p['ini'] <= s['fecha'] <= p['fin']]
    assert planes_ok, (s, tour)
    dias_a_servicio = (s['fecha'] - HOY).days
    if s['fecha'] < HOY:
        fill = random.uniform(0.35, 1.0) if random.random() > 0.12 else 1.0
    elif dias_a_servicio <= 45:
        fill = random.uniform(0.25, 0.95)
    elif dias_a_servicio <= 100:
        fill = random.uniform(0.0, 0.6)
    else:
        fill = random.uniform(0.0, 0.3)
    if s['estado'] == 'CANCELADA':
        fill = random.uniform(0.15, 0.5)
    quedan = int(s['cupo'] * fill)
    grupos = []
    while quedan > 0:
        g = min(quedan, random.choices([1, 2, 3, 4, 5, 6, 8], weights=[8, 30, 18, 20, 9, 7, 3], k=1)[0])
        grupos.append(g)
        quedan -= g
    # reservas canceladas por el cliente (no cuentan para el cupo)
    extras = [random.choice([1, 2, 3, 4]) for _ in range(sum(1 for _ in grupos if random.random() < RES_PROB_CANCEL))] if s['estado'] != 'CANCELADA' else []
    for g, cancelada_cliente in [(g, False) for g in grupos] + [(g, True) for g in extras]:
        c = elegir_cliente()
        plan = random.choice(planes_ok)
        # estado
        if s['estado'] == 'CANCELADA':
            estado = 'CANCELADA'
            motivo = 'OPERADOR'
        elif cancelada_cliente:
            estado, motivo = 'CANCELADA', 'CLIENTE'
        elif s['estado'] == 'REALIZADA':
            estado, motivo = 'COMPLETADA', None
        else:
            estado = pick(['CONFIRMADA', 'PENDIENTE'], [62, 38])
            motivo = None
        # precio aplicado (algunas reservas se hicieron con un precio anterior)
        precio = tour['precio']
        if random.random() < 0.12:
            precio = int(round(precio * random.choice([0.9, 0.92, 0.95]) / 500) * 500)
        cre = crear_creacion(s['fecha'], plan['ini'])
        r = dict(tipo='TOUR', cliente=c, plan=plan['id'], estado=estado, motivo=motivo, servicio=s['fecha'], creacion=cre,
                 valor=Decimal(g * precio), canal=canal_para(c, True), salida=s['id'], precio_aplicado=Decimal(precio), n=g)
        reservas.append(r)

n_tour = len(reservas)
# --- reservas de planes (no tour)
OBJETIVO = 540
no_tour_planes = [p for p in PLANES]
pesos_plan = []
for p in no_tour_planes:
    info = PINFO[p['key']]
    w = 4 if info[6] else 5
    if p['key'] in ('hacienda', 'cabanas', 'trucha', 'jeep'):
        w = 12
    if p['key'] in ('boutique', 'viajescafe', 'paisaje'):
        w = 9
    if info[4] != 'ACTIVO':
        w = 3
    pesos_plan.append(w)
while len(reservas) < OBJETIVO:
    p = random.choices(no_tour_planes, weights=pesos_plan, k=1)[0]
    # las reservas de planes de prestadores de tours tambien existen (ej. paquetes) pero no son reservas de tour
    lo, hi = p['ini'] + dt.timedelta(days=5), min(p['fin'], D(2027, 2, 28))
    if p['estado'] == 'INACTIVO':
        hi = p['fin']
    if lo >= hi:
        continue
    # sesgo hacia fechas pasadas y temporada alta
    span = (hi - lo).days
    servicio = lo + dt.timedelta(days=int(random.betavariate(1.0, 1.0) * span))
    if servicio >= HOY + dt.timedelta(days=100) and random.random() < 0.6:
        continue
    c = elegir_cliente()
    canal = canal_para(c, False)
    # mismas fechas, estado segun fecha
    if servicio < HOY:
        estado = pick(['COMPLETADA', 'CANCELADA'], [84, 16])
    else:
        estado = pick(['CONFIRMADA', 'PENDIENTE', 'CANCELADA'], [58, 28, 14])
    k = pick([1, 2, 3, 4, 5], [48, 26, 13, 8, 5])
    if PINFO[p['key']][2] in ('GASTRONOMIA', 'ATRACCION', 'ALQUILER_VEHICULOS'):
        k = pick([1, 2, 3, 4, 6], [20, 35, 20, 15, 10])
    cre = crear_creacion(servicio, p['ini'])
    reservas.append(dict(tipo='PLAN', cliente=c, plan=p['id'], estado=estado, motivo='CLIENTE' if estado == 'CANCELADA' else None,
                         servicio=servicio, creacion=cre, valor=Decimal(p['precio'] * k), canal=canal, salida=None,
                         precio_aplicado=None, n=k))

# asignar ids de reserva ordenados por fecha de creacion
random.shuffle(reservas)
reservas.sort(key=lambda r: (r['creacion'], r['servicio']))
for i, r in enumerate(reservas, 1):
    r['id'] = i
    assert r['servicio'] >= r['creacion']

# ------------------------------------------------------------------ participantes de las reservas de tour
part_id = 0
for r in reservas:
    if r['tipo'] != 'TOUR':
        continue
    s = SAL[r['salida']]
    tour = TOUR[s['tour']]
    c = r['cliente']
    g = r['n']
    edad_c = max(18, edad_en(c['nac'], s['fecha']))
    items = []
    # el primer participante es el propio cliente casi siempre (la reserva la hace el que viaja)
    items.append((f"{c['nombres'].split()[0]} {c['apellidos']}", edad_c))
    ap_base = c['apellidos'].split()[0]
    for j in range(1, g):
        es_menor = tour['edad_min'] < 18 and random.random() < 0.28
        if es_menor:
            edad = random.randint(max(tour['edad_min'], 0), 17)
        else:
            edad = random.randint(18, 72)
        nombre = pick(NOM_F + NOM_M) + ' ' + (ap_base if random.random() < 0.6 else pick(APELL)) + ' ' + pick(APELL)
        items.append((nombre, edad))
    # D14: si hay un menor debe haber un adulto (el cliente lo es)
    for nombre, edad in items:
        part_id += 1
        participantes.append((part_id, nombre[:100], edad, r['id']))
        assert edad >= tour['edad_min'] or False, (nombre, edad, tour)

# ------------------------------------------------------------------ pagos
METODOS_ONLINE = ['TARJETA_CREDITO', 'PSE', 'TARJETA_DEBITO', 'TRANSFERENCIA']


def metodo_para(r):
    if r['canal'] in ('WEB', 'APP_MOVIL'):
        return pick(['TARJETA_CREDITO', 'PSE', 'TARJETA_DEBITO'], [38, 40, 22])
    if r['canal'] == 'MOSTRADOR':
        return pick(['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA'], [45, 25, 20, 10])
    if r['canal'] == 'TELEFONO':
        return pick(['TRANSFERENCIA', 'TARJETA_CREDITO', 'PSE', 'EFECTIVO'], [40, 30, 20, 10])
    return pick(['TRANSFERENCIA', 'TARJETA_CREDITO', 'PSE'], [55, 25, 20])


refs = set()
prefijo = {'TARJETA_CREDITO': 'TC', 'TARJETA_DEBITO': 'TD', 'PSE': 'PSE'}


def referencia(metodo, fecha):
    if metodo not in prefijo:
        return None
    while True:
        ref = f"{prefijo[metodo]}-{fecha.strftime('%Y%m%d')}-{''.join(random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ23456789') for _ in range(8))}"
        if ref not in refs:
            refs.add(ref)
            return ref


def ts(fecha, h_lo=7, h_hi=21):
    if fecha >= HOY:
        h_hi = 9
        h_lo = 6
    return dt.datetime(fecha.year, fecha.month, fecha.day, random.randint(h_lo, h_hi), random.randint(0, 59), random.randint(0, 59))


def dia_pago(r, dias_max=2):
    f = r['creacion'] + dt.timedelta(days=random.randint(0, dias_max))
    return min(f, HOY, r['servicio'])


pagos = []   # dict


def add_pago(r, fecha_hora, monto, metodo, estado):
    pagos.append(dict(reserva=r['id'], fh=fecha_hora, monto=Decimal(monto), metodo=metodo, estado=estado,
                      ref=referencia(metodo, fecha_hora.date())))


def split_total(total, frac):
    a = int(round(int(total) * frac / 1000) * 1000)
    if a <= 0 or a >= int(total):
        return None
    return a, int(total) - a


for r in reservas:
    total = int(r['valor'])
    metodo = metodo_para(r)
    r['pagado'] = 0
    r['ultimo_pago'] = None
    est = r['estado']
    if est in ('COMPLETADA', 'CONFIRMADA', 'CANCELADA'):
        if est == 'CANCELADA':
            if random.random() > 0.62:
                r['cancel_fecha'] = None   # se define abajo
                continue
        # intento fallido previo (tarjeta/PSE)
        if metodo in prefijo and random.random() < 0.09:
            d0 = dia_pago(r, 1)
            add_pago(r, ts(d0), total, metodo, 'FALLIDO')
        parcial = (random.random() < 0.4) if est == 'CONFIRMADA' else (random.random() < 0.18)
        if parcial:
            sp = split_total(total, random.choice([0.3, 0.4, 0.5, 0.5, 0.6]))
        else:
            sp = None
        d1 = dia_pago(r, 2)
        if sp:
            add_pago(r, ts(d1), sp[0], metodo, 'EXITOSO')
            r['pagado'] += sp[0]
            r['ultimo_pago'] = d1
            if est in ('COMPLETADA', 'CONFIRMADA') or (est == 'CANCELADA' and random.random() < 0.3):
                m2 = metodo if random.random() < 0.7 else pick(['TRANSFERENCIA', 'EFECTIVO', 'PSE'])
                d2 = min(max(d1, r['servicio'] - dt.timedelta(days=random.randint(0, 12))), HOY)
                if d2 > r['servicio']:
                    d2 = r['servicio']
                d2 = max(d2, d1)
                add_pago(r, ts(d2), sp[1], m2, 'EXITOSO')
                r['pagado'] += sp[1]
                r['ultimo_pago'] = d2
        else:
            add_pago(r, ts(d1), total, metodo, 'EXITOSO')
            r['pagado'] += total
            r['ultimo_pago'] = d1
    elif est == 'PENDIENTE':
        u = random.random()
        d0 = dia_pago(r, 1)
        if u < 0.18:
            # anticipo exitoso: la reserva sigue PENDIENTE hasta cubrir el valor total (RN07)
            sp = split_total(total, random.choice([0.3, 0.4, 0.5]))
            if sp:
                add_pago(r, ts(d0), sp[0], metodo, 'EXITOSO')
                r['pagado'] += sp[0]
                r['ultimo_pago'] = d0
        elif u < 0.40:
            m = pick(['PSE', 'TRANSFERENCIA', 'TARJETA_CREDITO'], [45, 35, 20])
            add_pago(r, ts(d0), total if random.random() < .7 else (split_total(total, .5) or (total,))[0], m, 'PENDIENTE')
        elif u < 0.54:
            m = pick(['TARJETA_CREDITO', 'TARJETA_DEBITO', 'PSE'])
            add_pago(r, ts(d0), total, m, 'FALLIDO')

# cancelaciones: fecha de cancelacion y reembolso
for r in reservas:
    if r['estado'] != 'CANCELADA':
        continue
    ult = r.get('ultimo_pago') or r['creacion']
    lead = random.randint(1, 12)
    cf = max(ult, min(HOY, r['servicio'] - dt.timedelta(days=lead)))
    if cf < r['creacion']:
        cf = r['creacion']
    if cf > r['servicio']:
        cf = r['servicio'] if r['servicio'] >= ult else ult
    r['cancel_fecha'] = cf
    dias = (r['servicio'] - cf).days
    r['dias_cancel'] = dias
    if r['motivo'] == 'OPERADOR':
        pct = Decimal('1.00')
    else:
        pct = Decimal('0.80') if dias > 5 else Decimal('0')
    r['pct_reembolso'] = pct
    if r['pagado'] > 0 and pct > 0:
        monto = (Decimal(r['pagado']) * pct).quantize(Decimal('0.01'))
        # metodo del reembolso: el mismo del ultimo pago exitoso
        ult_p = [p for p in pagos if p['reserva'] == r['id'] and p['estado'] == 'EXITOSO'][-1]
        # el reembolso se registra el mismo dia de la cancelacion (asi RN08 se puede comprobar con SQL)
        if cf == ult_p['fh'].date():
            fh = ts(cf, 22, 23) if cf < HOY else dt.datetime(cf.year, cf.month, cf.day, 10, random.randint(0, 59), 0)
        else:
            fh = ts(cf)
        assert monto <= r['pagado']
        add_pago(r, fh, monto, ult_p['metodo'], 'REEMBOLSADO')
        r['reembolso_fecha'] = fh.date()

pagos.sort(key=lambda p: (p['fh'], p['reserva']))
for i, p in enumerate(pagos, 1):
    p['id'] = i
assert len(pagos) >= 500, len(pagos)

# ------------------------------------------------------------------ notificaciones
notifs = []


def estado_notif(f_prog, canal=None):
    """Segun la fecha programada: futura -> PENDIENTE; pasada -> ENVIADA/LEIDA/FALLIDA."""
    if f_prog > HOY:
        return 'PENDIENTE', None
    e = pick(['ENVIADA', 'LEIDA', 'FALLIDA'], [48, 40, 12])
    if canal == 'SMS' and random.random() < 0.08:
        e = 'FALLIDA'
    if e == 'FALLIDA':
        return e, None
    real = min(f_prog + dt.timedelta(days=random.choice([0, 0, 0, 0, 1])), HOY)
    return e, real


def add_notif(tipo, r, c, f_prog, mensaje):
    canal = c['canal_notif']
    e, real = estado_notif(f_prog, canal)
    notifs.append(dict(tipo=tipo, canal=canal, mensaje=mensaje[:400], prog=f_prog, real=real, estado=e,
                       cliente=c['id'], reserva=r['id'] if r else None))


def nombre_plan(r):
    return plan_rows[r['plan'] - 1][1]


def nombre_prest(r):
    return prest_rows[PLAN[r['plan']]['prest'] - 1][1]


for r in reservas:
    c = r['cliente']
    pn = nombre_plan(r)
    pr = nombre_prest(r)
    ref = f"QS-{r['id']:05d}"
    fs = r['servicio'].strftime('%d/%m/%Y')
    nom = c['nombres'].split()[0]
    if r['tipo'] == 'TOUR':
        s = SAL[r['salida']]
        detalle = f"tour «{TOUR[s['tour']]['nombre']}» del {fs} a las {s['hora'].strftime('%H:%M')}"
    else:
        detalle = f"plan «{pn}» de {pr} para el {fs}"
    if r['estado'] in ('CONFIRMADA', 'COMPLETADA'):
        add_notif('CONFIRMACION_RESERVA', r, c, min(r['creacion'] + dt.timedelta(days=random.choice([0, 0, 1])), r['servicio']),
                  f"Hola {nom}, tu reserva {ref} quedó confirmada: {detalle}. ¡Te esperamos en el Quindío!")
        if c["perfil"] and random.random() < 0.6:
            fr = r['servicio'] - dt.timedelta(days=c['perfil']['antic'])
            if fr >= r['creacion']:
                add_notif('RECORDATORIO_RESERVA', r, c, fr,
                          f"Recordatorio: faltan {c['perfil']['antic']} día(s) para tu {detalle}. Reserva {ref}.")
        if r['estado'] == 'COMPLETADA' and random.random() < 0.18:
            add_notif('CAMBIO_ESTADO', r, c, r['servicio'], f"Tu reserva {ref} pasó a COMPLETADA. Gracias por viajar con QuindíoStay, {nom}.")
    elif r['estado'] == 'CANCELADA':
        add_notif('CAMBIO_ESTADO', r, c, r['cancel_fecha'],
                  f"Tu reserva {ref} fue cancelada" + (" porque el operador canceló la salida; se reembolsa el 100 % de lo pagado." if r['motivo'] == 'OPERADOR'
                                                       else (". Cancelaste con más de 5 días de anticipación: se reembolsa el 80 % de lo pagado." if r['pct_reembolso'] > 0
                                                             else ". Cancelaste con 5 días o menos de anticipación: según la política no aplica reembolso.")))
    else:  # PENDIENTE
        if random.random() < 0.35:
            add_notif('CAMBIO_ESTADO', r, c, min(r['creacion'], HOY), f"Recibimos tu reserva {ref} ({detalle}). Queda PENDIENTE hasta confirmar el pago.")
# confirmaciones de pago
por_reserva = defaultdict(list)
for p in pagos:
    por_reserva[p['reserva']].append(p)
RES = {r['id']: r for r in reservas}
for rid, lst in por_reserva.items():
    ex = [p for p in lst if p['estado'] == 'EXITOSO']
    if ex and random.random() < 0.3:
        r = RES[rid]
        p = ex[0]
        add_notif('CONFIRMACION_PAGO', r, r['cliente'], p['fh'].date(),
                  f"Recibimos tu pago de ${int(p['monto']):,} COP ({p['metodo'].replace('_', ' ').title()}) para la reserva QS-{rid:05d}.".replace(',', '.'))

n_ligadas = len(notifs)
# promociones: solo a clientes que aceptan promociones
PROMO_MSG = ['Temporada de cosecha: 15 % de descuento en tours cafeteros reservando con 10 días de anticipación.',
             'Vuelve al Valle de Cocora: 2x1 en caminatas guiadas de lunes a jueves.',
             'Puente festivo en el Eje Cafetero: reserva hoy tu plan y recibe una cata de café de cortesía.',
             'Plan familiar: niños menores de 8 años no pagan en tours seleccionados este mes.',
             'Fin de año en el Quindío: hospedaje + tour con 20 % de descuento hasta agotar cupos.',
             'Descubre pueblos patrimonio: paquete Filandia–Salento con transporte incluido.',
             'Semana del café: catas y talleres con precio especial para clientes frecuentes.',
             'Aventura de temporada: canopy y cabalgata en un solo plan, cupos limitados.']
promo_clientes = [c for c in clientes if c['perfil'] and c['perfil']['promo'] == 'SI']
OBJETIVO_NOTIF = 900
n_promos = max(120, OBJETIVO_NOTIF - n_ligadas)
for _ in range(n_promos):
    c = random.choice(promo_clientes)
    f = D(2026, 3, 1) + dt.timedelta(days=random.randint(0, 300))     # 2026-03-01 .. 2026-12-26
    notifs.append(dict(tipo='PROMOCION', canal=c['canal_notif'], mensaje=f"Hola {c['nombres'].split()[0]}: " + random.choice(PROMO_MSG),
                       prog=f, real=None, estado=None, cliente=c['id'], reserva=None))
    e, real = estado_notif(f, c['canal_notif'])
    notifs[-1]['estado'], notifs[-1]['real'] = e, real

notifs.sort(key=lambda n: (n['prog'], n['cliente']))
for i, n in enumerate(notifs, 1):
    n['id'] = i
assert len(notifs) >= 800, len(notifs)

# ------------------------------------------------------------------ verificaciones internas (reglas de aplicacion)
usados = defaultdict(int)
for p in participantes:
    r = RES[p[3]]
    if r['estado'] != 'CANCELADA':
        usados[r['salida']] += 1
for sid, n in usados.items():
    assert n <= SAL[sid]['cupo'], (sid, n, SAL[sid]['cupo'])
for r in reservas:
    assert PLAN[r['plan']]['ini'] <= r['servicio'] <= PLAN[r['plan']]['fin']
    if r['canal'] in ('WEB', 'APP_MOVIL'):
        assert r['cliente']['perfil'], r
    if r['tipo'] == 'TOUR':
        s = SAL[r['salida']]
        assert r['servicio'] == s['fecha']
        assert PLAN[r['plan']]['prest'] == TOUR[s['tour']]['prest']
        assert r['valor'] == r['n'] * r['precio_aplicado']
    if r['estado'] == 'COMPLETADA':
        assert r['servicio'] < HOY
    if r['estado'] in ('CONFIRMADA', 'PENDIENTE'):
        assert r['servicio'] >= HOY, r
    assert r['creacion'] <= HOY
for p in pagos:
    r = RES[p['reserva']]
    if p['estado'] == 'REEMBOLSADO':
        assert r['estado'] == 'CANCELADA'
    assert p['fh'].date() >= r['creacion'], (p, r['creacion'])
    assert p['fh'].date() <= HOY
for rid, lst in por_reserva.items():
    ex = sum(p['monto'] for p in lst if p['estado'] == 'EXITOSO')
    rb = sum(p['monto'] for p in lst if p['estado'] == 'REEMBOLSADO')
    assert rb <= ex
    assert ex <= RES[rid]['valor'], (rid, ex, RES[rid]['valor'])
for r in reservas:
    if r['estado'] in ('CONFIRMADA', 'COMPLETADA'):
        assert r['pagado'] == int(r['valor']), (r['id'], r['pagado'], r['valor'])
    if r['estado'] == 'CANCELADA' and r['motivo'] == 'CLIENTE':
        assert (r['pct_reembolso'] > 0) == (r['dias_cancel'] > 5)
for s in salidas:
    assert PRESTADORES[TOUR[s['tour']]['prest'] - 1][4] == 'ACTIVO'
    assert PRESTADORES[TOUR[s['tour']]['prest'] - 1][2] == 'GUIANZA'   # RN12
    assert any(l == s['idioma'] for l in guia_langs[s['id_guia']])
for n in notifs:
    if n['reserva']:
        assert RES[n['reserva']]['cliente']['id'] == n['cliente']
    else:
        assert n['tipo'] == 'PROMOCION'
        cc = clientes[n['cliente'] - 1]
        assert cc['perfil'] and cc['perfil']['promo'] == 'SI'
    assert n['real'] is None or n['real'] >= n['prog']
for c in clientes:
    if c['tdoc'] == 'CC':
        assert edad_en(c['nac'], HOY) >= 18

# ------------------------------------------------------------------ salida del SQL
out = []
W = out.append


def bloque(tabla, cols, filas, por=100, comentario=None):
    if comentario:
        W(f'\n-- {comentario}')
    for i in range(0, len(filas), por):
        trozo = filas[i:i + por]
        W(f"INSERT INTO {tabla} ({', '.join(cols)}) VALUES")
        W(',\n'.join('(' + ', '.join(q(v) for v in f) + ')' for f in trozo) + ';')


W('''-- =============================================================================
-- QUINDÍOSTAY · Bases de Datos I 2026-2 · Universidad del Quindío · Grupo 02D
-- Script 02 · Carga de datos (DML) — GENERADO, no editar a mano
-- Requiere haber ejecutado antes 01_esquema.sql sobre una base vacía.
--
-- Datos de ejemplo con apariencia real y distribución asimétrica (pocos
-- prestadores y clientes concentran muchas reservas; no todas las tablas
-- crecen parejo). Fecha "de hoy" usada para estados y fechas: 2026-11-11.
--
-- Volúmenes cargados:
--   municipio 12 · tipo_prestador 8 · rol 3 · prestador 20 · usuario_sistema %d
--   cliente %d · perfil_cliente %d · plan %d · reserva %d · pago %d · notificacion %d
--   categoria_tour 4 · idioma 5 · guia %d · guia_idioma %d · tour %d · salida_tour %d
--   reserva_tour %d · participante %d
--
-- Contraseñas de prueba (cifradas con BCrypt, cost 10):
--   admin / Admin123*   operador y operador2 / Operador123*
--   enc_* / Encargado123* (enc_aves está BLOQUEADO)   clientes con perfil / Cliente123*
--
-- Se inserta en orden de dependencias (padres antes que hijas), con los ids explícitos.
-- =============================================================================
USE quindiostay;
SET NAMES utf8mb4;
START TRANSACTION;''' % (len(usuario_rows), len(clientes), len(perfil_rows), len(plan_rows), len(reservas), len(pagos), len(notifs),
                         len(guia_rows), len(guia_idioma_rows), len(tour_rows), len(salidas),
                         sum(1 for r in reservas if r['tipo'] == 'TOUR'), len(participantes)))

bloque('municipio', ['id_municipio', 'nombre', 'codigo_dane'], [(i + 1, n, c) for i, (n, c) in enumerate(MUNICIPIOS)], comentario='1. MUNICIPIOS DEL QUINDÍO (códigos DANE reales)')
bloque('tipo_prestador', ['id_tipo_prestador', 'nombre'], [(i + 1, n) for i, n in enumerate(TIPOS)], comentario='2. TIPOS DE PRESTADOR')
bloque('rol', ['id_rol', 'nombre'], [(i + 1, n) for i, n in enumerate(ROLES)], comentario='3. ROLES')
bloque('categoria_tour', ['id_categoria', 'nombre', 'descripcion'], [(i + 1, n, d) for i, (n, d) in enumerate(CATEGORIAS)], comentario='4. CATEGORÍAS DE TOUR')
bloque('idioma', ['id_idioma', 'nombre'], [(i + 1, n) for i, n in enumerate(IDIOMAS)], comentario='5. IDIOMAS')
bloque('prestador', ['id_prestador', 'nombre_comercial', 'nit_documento', 'rnt', 'direccion', 'telefono', 'correo', 'estado', 'id_municipio', 'id_tipo_prestador'],
       prest_rows, comentario='6. PRESTADORES (16 activos, 2 suspendidos o retirados cada estado minoritario)')
bloque('usuario_sistema', ['id_usuario', 'nombre_usuario', 'contrasena_cifrada', 'estado', 'id_rol', 'id_prestador'], usuario_rows,
       comentario='7. USUARIOS DEL SISTEMA')
bloque('cliente', ['id_cliente', 'nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'correo', 'telefono', 'fecha_nacimiento', 'ciudad_origen'],
       [(c['id'], c['nombres'], c['apellidos'], c['tdoc'], c['num'], c['correo'], c['tel'], c['nac'], c['ciudad']) for c in clientes],
       comentario='8. CLIENTES')
bloque('perfil_cliente', ['id_cliente', 'contrasena_cifrada', 'idioma_preferido', 'canal_preferido', 'anticipacion_dias', 'acepta_promociones'], perfil_rows,
       comentario='9. PERFILES DE CLIENTE (solo los clientes con cuenta)')
bloque('plan', ['id_plan', 'nombre', 'descripcion', 'tipo', 'precio', 'fecha_inicio', 'fecha_fin', 'estado', 'id_prestador'], plan_rows, comentario='10. PLANES')
bloque('guia', ['id_guia', 'nombre', 'documento', 'tarjeta_profesional'], guia_rows, comentario='11. GUÍAS')
bloque('guia_idioma', ['id_guia', 'id_idioma'], guia_idioma_rows, comentario='12. IDIOMAS DE CADA GUÍA')
bloque('tour', ['id_tour', 'nombre', 'descripcion', 'duracion_horas', 'dificultad', 'edad_minima', 'precio_persona', 'id_categoria', 'id_prestador'], tour_rows,
       comentario='13. TOURS')
bloque('salida_tour', ['id_salida', 'fecha', 'hora_inicio', 'cupo', 'estado', 'id_tour', 'id_guia', 'id_idioma'],
       [(s['id'], s['fecha'], s['hora'], s['cupo'], s['estado'], s['tour'], s['id_guia'], s['idioma']) for s in salidas], comentario='14. SALIDAS DE TOUR')
bloque('reserva', ['id_reserva', 'fecha_creacion', 'fecha_servicio', 'estado', 'valor_total', 'canal', 'id_cliente', 'id_plan'],
       [(r['id'], r['creacion'], r['servicio'], r['estado'], r['valor'], r['canal'], r['cliente']['id'], r['plan']) for r in reservas],
       comentario='15. RESERVAS (núcleo común)')
bloque('reserva_tour', ['id_reserva', 'id_salida', 'precio_persona_aplicado'],
       [(r['id'], r['salida'], r['precio_aplicado']) for r in reservas if r['tipo'] == 'TOUR'], comentario='16. RESERVAS DE TOUR (subtipo)')
bloque('participante', ['id_participante', 'nombre', 'edad', 'id_reserva'], participantes, comentario='17. PARTICIPANTES')
bloque('pago', ['id_pago', 'fecha_pago', 'monto', 'metodo', 'estado', 'referencia_transaccion', 'id_reserva'],
       [(p['id'], p['fh'], p['monto'], p['metodo'], p['estado'], p['ref'], p['reserva']) for p in pagos], comentario='18. PAGOS Y REEMBOLSOS')
bloque('notificacion', ['id_notificacion', 'tipo', 'canal', 'mensaje', 'fecha_programada', 'fecha_envio_real', 'estado', 'id_cliente', 'id_reserva'],
       [(n['id'], n['tipo'], n['canal'], n['mensaje'], n['prog'], n['real'], n['estado'], n['cliente'], n['reserva']) for n in notifs],
       comentario='19. NOTIFICACIONES')
W('\nCOMMIT;')
W('\n-- Fin de la carga.')
sys.stdout.write('\n'.join(out) + '\n')

# resumen a stderr
sys.stderr.write(f"prestador {len(prest_rows)} cliente {len(clientes)} perfil {len(perfil_rows)} plan {len(plan_rows)} guia {len(guia_rows)} "
                 f"tour {len(tour_rows)} salida {len(salidas)} reserva {len(reservas)} (tour {n_tour}) part {len(participantes)} "
                 f"pago {len(pagos)} notif {len(notifs)} (ligadas {n_ligadas}, promos {n_promos})\n")
from collections import Counter
sys.stderr.write('reserva estados ' + str(Counter(r['estado'] for r in reservas)) + '\n')
sys.stderr.write('pago estados ' + str(Counter(p['estado'] for p in pagos)) + '\n')
sys.stderr.write('salida estados ' + str(Counter(s['estado'] for s in salidas)) + '\n')
