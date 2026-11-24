-- =====================================================================
-- The House Fit - Datos de ejemplo (los mismos que trae el cliente)
-- Ejecutar despues de 01_esquema.sql
-- La clave de los 3 usuarios de prueba es 123456
-- =====================================================================

-- ---------- usuarios ----------
INSERT INTO usuarios (nombre, correo, password_hash, rol, correo_verificado, fecha_registro) VALUES
 ('Administrador The House Fit','admin@thehousefit.com','$2a$10$uMrGLQGBin8BZ4yFot8UFOwJ8TfNS/HLffZFv/UHD7VI2kSoiFy/q','Administrador',TRUE,'2026-01-10'),
 ('Marlon Monsalve','entrenador@thehousefit.com','$2a$10$uMrGLQGBin8BZ4yFot8UFOwJ8TfNS/HLffZFv/UHD7VI2kSoiFy/q','Entrenador',TRUE,'2026-01-15'),
 ('Andrés Torres','usuario@thehousefit.com','$2a$10$uMrGLQGBin8BZ4yFot8UFOwJ8TfNS/HLffZFv/UHD7VI2kSoiFy/q','Usuario',TRUE,'2026-02-01');

-- ---------- gimnasios ----------
INSERT INTO gimnasios (nombre,direccion,barrio,ciudad,pais,telefono,horario,descripcion,imagen,fotos,precio,moneda,servicios,activo,lat,lng) VALUES
 ('KAIROS GYM','Cra 23 # 15-40','Centro','Yopal','Colombia','3211234567','Lunes a sábado 5:00am - 9:00pm',
  'Gimnasio con máquinas de última generación y zona de pesas libres.','💪',
  ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'],
  120000,'COP',ARRAY['Musculación','Cardio','Entrenamiento funcional'],TRUE,5.3378,-72.3959),
 ('GYM SENA','Calle 8 # 20-15','La Campiña','Yopal','Colombia','3129876543','Lunes a domingo 6:00am - 10:00pm',
  'Espacio integral con clases grupales, spinning y zona de estiramiento.','🏋️',
  ARRAY['https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80'],
  95000,'COP',ARRAY['Spinning','Zumba','Yoga'],TRUE,5.335,-72.4),
 ('SMART FIT','Av. Circunvalar # 5-22','La Esperanza','Yopal','Colombia','3005551234','Lunes a sábado 4:30am - 10:00pm',
  'Enfocado en levantamiento de potencia y entrenamiento avanzado.','🏆',
  ARRAY['https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1583500178690-f7fd8b7e6c33?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80'],
  140000,'COP',ARRAY['Powerlifting','Crossfit','Asesoría nutricional'],TRUE,5.34,-72.39),
 ('Yopal','Calle Gran Vía 45','Centro','Madrid','España','+34 611 234 567','Lunes a domingo 6:00am - 11:00pm',
  'Estudio boutique especializado en fuerza funcional y coaching personalizado.','🏙️',
  ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80'],
  45,'EUR',ARRAY['Entrenamiento funcional','Crossfit','Nutrición'],TRUE,40.42,-3.7038),
 ('CYC GYM','210 Ocean Drive','South Beach','Miami','Estados Unidos','+1 305 555 0192','Lunes a domingo 5:00am - 12:00am',
  'Gimnasio frente al mar con clases al aire libre y vista a la playa.','🌴',
  ARRAY['https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=900&q=80'],
  60,'USD',ARRAY['Cardio','Yoga','Entrenamiento funcional'],TRUE,25.7815,-80.13),
 ('Aguazul Iron Club','Cra 15 # 93-40','Chicó','Bogotá','Colombia','3187654321','Lunes a sábado 5:00am - 10:00pm',
  'Gimnasio premium en el norte de Bogotá con zona de crossfit y sauna.','🏢',
  ARRAY['https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'],
  180000,'COP',ARRAY['Crossfit','Musculación','Spinning'],TRUE,4.6767,-74.0483);

-- ---------- instructores ----------
INSERT INTO instructores (nombre,correo,telefono,especialidad,experiencia,biografia,imagen,gimnasio_id,activo) VALUES
 ('Marlon Monsalve','marlon.instructor@thehousefit.com','3211112233','Musculación y fuerza',6,
  'Entrenador certificado especializado en hipertrofia y técnica de levantamiento.','🧑‍🏫',1,TRUE),
 ('Laura Sánchez','laura.instructor@thehousefit.com','3004445566','Yoga y flexibilidad',4,
  'Instructora de yoga y movilidad articular, enfoque en bienestar integral.','🧘',2,TRUE);

-- ---------- clases ----------
INSERT INTO clases (gimnasio_id,tipo_clase,instructor,hora,cupos,duracion,precio) VALUES
 (1,'CrossFit','Marlon Monsalve','6:00 am',12,'50 min',25000),
 (1,'Funcional','Marlon Monsalve','5:30 pm',15,'45 min',22000),
 (2,'Yoga','Laura Sánchez','7:00 am',10,'60 min',20000),
 (2,'Spinning','Laura Sánchez','6:30 pm',18,'45 min',18000),
 (3,'Boxeo','Marlon Monsalve','8:00 am',8,'55 min',28000),
 (3,'Pilates','Laura Sánchez','4:00 pm',12,'50 min',24000);

-- ---------- productos ----------
INSERT INTO productos (nombre,categoria,precio,stock,descripcion,guia_nutricional,imagen) VALUES
 ('Proteína Whey 2Lb','Suplemento',120000,35,'Proteína de suero para recuperación muscular.','Consumir 1 scoop (30g) después del entrenamiento junto con agua o leche.','🥤'),
 ('Guantes de entrenamiento','Implemento',45000,60,'Guantes acolchados para levantamiento de pesas.','','🧤'),
 ('Creatina Monohidratada 300g','Suplemento',85000,40,'Suplemento para fuerza y rendimiento.','Dosis diaria de 5g, preferiblemente después de entrenar.','💊'),
 ('Camiseta deportiva dry-fit','Ropa deportiva',55000,80,'Camiseta transpirable ideal para entrenamiento de alta intensidad.','','👕');

-- ---------- reseñas y noticias ----------
INSERT INTO resenas (gimnasio_id,usuario,titulo,cuerpo,imagen,puntuacion,fecha) VALUES
 (1,'Andrés Torres','Excelente ambiente y máquinas nuevas','Llevo 3 meses entrenando aquí y la atención de los instructores es muy buena.','⭐',5,'2026-06-12'),
 (2,'María Gómez','Buenas clases grupales','Las clases de zumba son geniales, aunque en horas pico hay bastante gente.','⭐',4,'2026-06-20');

INSERT INTO noticias (titulo,cuerpo,imagen,tipo,gimnasio_id,fecha) VALUES
 ('Nueva promoción de matrícula','Este mes matricúlate con 20% de descuento en tu plan mensual.','🎉','Promoción',1,'2026-08-01'),
 ('Llegaron nuevas máquinas de cardio','Renovamos nuestra zona de cardio con equipos de última generación.','📰','Novedad',2,'2026-07-28');

-- ---------- rutinas y guías ----------
INSERT INTO rutinas (tipo_entrenamiento,nombre,nivel,descripcion,ejercicios,duracion_semanas) VALUES
 ('Fuerza','Rutina de fuerza - Tren superior','Intermedio','Enfocada en desarrollar fuerza en pecho, espalda y brazos.',
  ARRAY['Press de banca 4x8','Remo con barra 4x8','Press militar 3x10','Curl de bíceps 3x12'],6),
 ('Cardio','Rutina cardiovascular quema grasa','Principiante','Sesiones de cardio moderado para mejorar resistencia y quemar calorías.',
  ARRAY['Trote 20 min','Bicicleta estática 15 min','Saltos de cuerda 3x2min'],4),
 ('Funcional','Entrenamiento funcional total body','Intermedio','Movimientos multiarticulares que trabajan todo el cuerpo.',
  ARRAY['Burpees 4x15','Kettlebell swing 4x15','Mountain climbers 4x20','Sentadilla con salto 4x12'],5),
 ('Pérdida de peso','Plan de pérdida de peso acelerado','Principiante','Combinación de cardio y fuerza para maximizar el gasto calórico.',
  ARRAY['Circuito HIIT 20 min','Sentadillas 4x15','Plancha 3x40seg'],8),
 ('Flexibilidad','Rutina de movilidad y flexibilidad','Principiante','Estiramientos y movilidad articular para prevenir lesiones.',
  ARRAY['Estiramiento de isquiotibiales','Movilidad de cadera','Yoga flow 15 min'],4);

INSERT INTO guias_fisicas (titulo,metodo,contenido,fecha_publicacion) VALUES
 ('Manual de técnica de sentadilla','Fuerza','Coloca la barra sobre los trapecios, pies al ancho de hombros, baja controlando la rodilla en línea con la punta del pie y mantén la espalda recta durante todo el recorrido.','2026-02-10'),
 ('Guía de entrenamiento en circuito','Funcional','Alterna ejercicios de 40 segundos de trabajo por 20 segundos de descanso, completando 4 rondas por sesión para maximizar la quema calórica.','2026-03-02');

INSERT INTO guias_nutricionales (categoria_imc,titulo,recomendaciones,ejemplo_comidas) VALUES
 ('Bajo peso','Plan de alimentación para aumento de masa','Aumenta la ingesta calórica con proteínas magras, carbohidratos complejos y grasas saludables.','Desayuno: avena con maní y banano. Almuerzo: pollo, arroz y aguacate. Cena: pasta con carne y ensalada.'),
 ('Peso normal','Plan de mantenimiento saludable','Mantén una dieta balanceada con proteína, vegetales y grasas saludables en cada comida.','Desayuno: huevos y fruta. Almuerzo: pescado, quinoa y vegetales. Cena: ensalada con pollo a la plancha.'),
 ('Sobrepeso','Plan de control de peso','Reduce carbohidratos refinados, aumenta fibra y vegetales, controla las porciones.','Desayuno: batido de proteína con espinaca. Almuerzo: pechuga a la plancha con ensalada. Cena: sopa de vegetales.'),
 ('Obesidad','Plan de reducción calórica supervisada','Déficit calórico moderado, alta ingesta de proteína y vegetales, acompañamiento profesional recomendado.','Desayuno: claras de huevo y vegetales. Almuerzo: proteína magra con ensalada abundante. Cena: caldo de vegetales con pollo.');

-- ---------- pagos ----------
INSERT INTO metodos_pago (nombre,icono,descripcion,disponible) VALUES
 ('Tarjeta de crédito/débito','💳','Pago seguro con Visa, Mastercard u otras.',TRUE),
 ('PSE','🏦','Pago directo desde tu cuenta bancaria.',TRUE),
 ('Efectivo en gimnasio','💵','Paga directamente en recepción.',TRUE),
 ('Nequi / Daviplata','📱','Pago rápido desde tu billetera digital.',TRUE);
