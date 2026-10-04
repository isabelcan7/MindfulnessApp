const ESCALA_FFMQ = ['Nunca o muy raramente', 'Raramente', 'A veces', 'A menudo', 'Muy a menudo o siempre'];
const ESCALA_PSS = ['Nunca', 'Casi nunca', 'De vez en cuando', 'A menudo', 'Muy a menudo'];
const ESCALA_MAAS = ['Casi siempre', 'Muy frecuentemente', 'Algo frecuentemente', 'Algo infrecuentemente', 'Muy infrecuentemente', 'Casi nunca'];
const ESCALA_DASS = ['No me ha ocurrido', 'Un poco o parte del tiempo', 'Bastante o buena parte del tiempo', 'Mucho o la mayor parte del tiempo'];
const ESCALA_PANAS = ['Muy poco o nada', 'Un poco', 'Moderadamente', 'Bastante', 'Extremadamente'];
const ESCALA_RYFF = ['Totalmente en desacuerdo', 'En desacuerdo', 'Algo en desacuerdo', 'Algo de acuerdo', 'De acuerdo', 'Totalmente de acuerdo'];
const ESCALA_SCS = ['Casi nunca', 'Pocas veces', 'A veces', 'Muchas veces', 'Casi siempre'];
const ESCALA_MAIA = ['Nunca', 'Casi nunca', 'Alguna vez', 'A menudo', 'Casi siempre', 'Siempre'];
const ESCALA_CBI = ['Nunca', 'Sólo alguna vez', 'Algunas veces', 'Muchas veces', 'Siempre'];

export const cuestionariosPredefinidos = [
    {
        id: 'FFMQ',
        nombre: 'FFMQ (Five Facet Mindfulness Questionnaire)',
        descripcion: 'Mide cinco dimensiones clave del mindfulness: observar, describir, actuar con conciencia, no juzgar y no reaccionar ante la experiencia interna.',
        version: 'Forma corta de 15 ítems (FFMQ-15)',
        etiquetas: ESCALA_FFMQ,
        textos: [
            'Cuando camino, me doy cuenta deliberadamente de las sensaciones de mi cuerpo al moverse.',
            'Se me da bien encontrar las palabras que describen mis sentimientos.',
            'Cuando hago algo, mi mente divaga y me distraigo fácilmente.',
            'Me critico por tener emociones irracionales o inapropiadas.',
            'Cuando tengo pensamientos o imágenes angustiosas, doy un paso atrás y soy consciente de ellos sin dejarme llevar.',
            'Percibo cómo los alimentos y las bebidas influyen en mis pensamientos, sensaciones corporales y emociones.',
            'Me cuesta encontrar las palabras para expresar lo que pienso.',
            'Me distraigo con facilidad.',
            'Creo que algunos de mis pensamientos son anormales o malos y que no debería pensar de esa manera.',
            'Cuando tengo pensamientos o imágenes angustiosas, me siento tranquilo poco después.',
            'Presto atención a sensaciones como el viento en mi pelo o el sol en mi cara.',
            'Incluso cuando me siento terriblemente alterado, puedo encontrar la manera de expresarlo con palabras.',
            'Me sorprendo haciendo cosas sin prestar atención.',
            'Juzgo si mis ideas son buenas o malas.',
            'Cuando tengo pensamientos o imágenes angustiosas, soy capaz de notarlos sin reaccionar.'
        ]
    },
    {
        id: 'PSS',
        nombre: 'PSS (Perceived Stress Scale)',
        descripcion: 'Evalúa el nivel de estrés percibido en la vida cotidiana durante el último mes.',
        version: '10 ítems (PSS-10)',
        etiquetas: ESCALA_PSS,
        textos: [
            'En el último mes, ¿con qué frecuencia ha estado afectado por algo que ha ocurrido inesperadamente?',
            'En el último mes, ¿con qué frecuencia se ha sentido incapaz de controlar las cosas importantes de su vida?',
            'En el último mes, ¿con qué frecuencia se ha sentido nervioso o estresado?',
            'En el último mes, ¿con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?',
            'En el último mes, ¿con qué frecuencia ha sentido que las cosas le van bien?',
            'En el último mes, ¿con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?',
            'En el último mes, ¿con qué frecuencia ha podido controlar las dificultades de su vida?',
            'En el último mes, ¿con qué frecuencia ha sentido que tenía todo bajo control?',
            'En el último mes, ¿con qué frecuencia ha estado enfadado porque las cosas que le han ocurrido estaban fuera de su control?',
            'En el último mes, ¿con qué frecuencia ha sentido que las dificultades se acumulan tanto que no puede superarlas?'
        ]
    },
    {
        id: 'MAAS',
        nombre: 'MAAS (Mindful Attention Awareness Scale)',
        descripcion: 'Mide el nivel de atención y conciencia plena durante el día.',
        version: '15 ítems',
        etiquetas: ESCALA_MAAS,
        textos: [
            'Podría experimentar alguna emoción y no ser consciente de ella hasta más tarde.',
            'Rompo o derramo cosas por descuido, por no poner atención o por estar pensando en otra cosa.',
            'Encuentro difícil estar centrado en lo que está pasando en el presente.',
            'Tiendo a caminar rápido para llegar a donde voy, sin prestar atención a lo que experimento durante el camino.',
            'Tiendo a no darme cuenta de sensaciones de tensión física o incomodidad hasta que captan mi atención.',
            'Me olvido del nombre de una persona casi de inmediato después de que me lo hayan dicho por primera vez.',
            'Parece que estoy funcionando en automático, sin demasiada conciencia de lo que hago.',
            'Hago las actividades con prisas, sin estar realmente atento a ellas.',
            'Me concentro tanto en la meta que deseo alcanzar que pierdo contacto con lo que estoy haciendo ahora para lograrla.',
            'Hago trabajos o tareas automáticamente, sin darme cuenta de lo que estoy haciendo.',
            'Me encuentro escuchando a alguien por una oreja y haciendo otra cosa al mismo tiempo.',
            'Conduzco en piloto automático y luego me pregunto por qué fui allí.',
            'Me encuentro absorto en el futuro o en el pasado.',
            'Me descubro haciendo cosas sin prestar atención.',
            'Como sin ser consciente de que estoy comiendo.'
        ]
    },
    {
        id: 'DASS',
        nombre: 'DASS-21 (Depression Anxiety Stress Scales)',
        descripcion: 'Mide los niveles de depresión, ansiedad y estrés durante la última semana.',
        version: '21 ítems (DASS-21)',
        etiquetas: ESCALA_DASS,
        textos: [
            'Me costó mucho relajarme.',
            'Me di cuenta de que tenía la boca seca.',
            'No podía sentir ningún sentimiento positivo.',
            'Se me hizo difícil respirar.',
            'Se me hizo difícil tomar la iniciativa para hacer cosas.',
            'Reaccioné exageradamente en ciertas situaciones.',
            'Sentí que mis manos temblaban.',
            'Sentí que estaba gastando una gran cantidad de energía.',
            'Me preocupé por situaciones en las que podía tener pánico o hacer el ridículo.',
            'Sentí que no tenía nada por qué ilusionarme.',
            'Me sentí agitado.',
            'Se me hizo difícil relajarme.',
            'Me sentí desanimado y triste.',
            'Fui intolerante con las cosas que me impedían seguir con lo que estaba haciendo.',
            'Sentí que estaba al punto del pánico.',
            'No me pude entusiasmar por nada.',
            'Sentí que valía muy poco como persona.',
            'Sentí que estaba bastante irritable.',
            'Sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico.',
            'Tuve miedo sin razón.',
            'Sentí que la vida no tenía ningún sentido.'
        ]
    },
    {
        id: 'PANAS',
        nombre: 'PANAS (Positive and Negative Affect Schedule)',
        descripcion: 'Evalúa los estados afectivos positivos y negativos que experimenta una persona en un momento dado.',
        version: '20 ítems',
        etiquetas: ESCALA_PANAS,
        textos: [
            'Interesado', 'Angustiado', 'Animado', 'Molesto', 'Fuerte',
            'Culpable', 'Asustado', 'Hostil', 'Entusiasmado', 'Orgulloso',
            'Irritable', 'Alerta', 'Avergonzado', 'Inspirado', 'Nervioso',
            'Decidido', 'Atento', 'Inquieto', 'Activo', 'Temeroso'
        ]
    },
    {
        id: "Ryff's",
        nombre: "Ryff's Psychological Well-Being Scales",
        descripcion: 'Evalúan el bienestar psicológico a través de seis dimensiones: autonomía, dominio del entorno, crecimiento personal, propósito en la vida, autoaceptación y relaciones positivas.',
        version: 'Forma corta de 18 ítems',
        etiquetas: ESCALA_RYFF,
        textos: [
            'No tengo miedo de expresar mis opiniones, incluso cuando se oponen a las opiniones de la mayoría.',
            'En general, siento que soy responsable de la situación en la que vivo.',
            'No me interesan las actividades que me puedan ampliar horizontes.',
            'La mayoría de la gente me ve como una persona cariñosa y afectuosa.',
            'Vivo la vida día a día y no pienso realmente en el futuro.',
            'Cuando repaso la historia de mi vida, estoy contento con cómo han resultado las cosas.',
            'Mis decisiones no suelen estar influidas por lo que hacen los demás.',
            'Las demandas de la vida diaria a menudo me desaniman.',
            'Para mí, la vida ha sido un proceso continuo de estudio, cambio y crecimiento.',
            'Sé que puedo confiar en mis amigos, y ellos saben que pueden confiar en mí.',
            'Tengo clara la dirección y el objetivo de mi vida.',
            'En general, me siento seguro y positivo conmigo mismo.',
            'Tiendo a preocuparme sobre lo que otra gente piensa de mí.',
            'Se me da bien organizar mi tiempo de forma que pueda hacer todo lo que hay que hacer.',
            'Hace mucho tiempo que dejé de intentar hacer grandes mejoras o cambios en mi vida.',
            'No he experimentado muchas relaciones cercanas y de confianza.',
            'Algunas personas van sin rumbo por la vida, pero yo no soy una de ellas.',
            'Me gusta la mayor parte de los aspectos de mi personalidad.'
        ]
    },
    {
        id: 'SCS',
        nombre: 'SCS (Self-Compassion Scale)',
        descripcion: 'Mide la autocompasión a través de sus componentes: amabilidad y autocrítica, humanidad común y aislamiento, mindfulness y sobreidentificación.',
        version: 'Forma corta de 12 ítems (SCS-SF)',
        etiquetas: ESCALA_SCS,
        textos: [
            'Cuando fracaso en algo importante para mí, me consumen los sentimientos de incompetencia.',
            'Intento ser comprensivo y paciente con los aspectos de mi personalidad que no me gustan.',
            'Cuando algo me resulta doloroso, intento mantener una visión equilibrada de la situación.',
            'Cuando me siento mal, tiendo a pensar que la mayoría de la gente es probablemente más feliz que yo.',
            'Intento ver mis fallos como parte de la condición humana.',
            'Cuando paso por una situación muy difícil, me doy el cariño y el cuidado que necesito.',
            'Cuando algo me molesta, intento mantener mis emociones en equilibrio.',
            'Cuando fracaso en algo importante para mí, tiendo a sentirme solo en mi fracaso.',
            'Cuando me siento mal, tiendo a obsesionarme y a fijarme en todo lo que está mal.',
            'Cuando me siento incompetente de alguna manera, intento recordar que la mayoría de la gente comparte esos sentimientos.',
            'Desapruebo mis propios defectos y limitaciones, y soy muy crítico con ellos.',
            'Soy intolerante e impaciente con los aspectos de mi personalidad que no me gustan.'
        ]
    },
    {
        id: 'MAIA',
        nombre: 'MAIA-2 (Multidimensional Assessment of Interoceptive Awareness)',
        descripcion: 'Mide la conciencia de las señales corporales a través de ocho dimensiones: darse cuenta, no distraerse, no preocuparse, regulación de la atención, conciencia emocional, autorregulación, escucha corporal y confianza.',
        version: '37 ítems (MAIA-2)',
        etiquetas: ESCALA_MAIA,
        textos: [
            'Cuando estoy tenso, noto dónde se ubica la tensión en mi cuerpo.',
            'Me doy cuenta cuando me siento incómodo en mi cuerpo.',
            'Cuando estoy cómodo, lo noto en partes concretas de mi cuerpo.',
            'Noto los cambios en mi respiración, como cuando se hace más lenta o más rápida.',
            'Ignoro la tensión física o el malestar hasta que se vuelven más intensos.',
            'Me distraigo de las sensaciones de malestar.',
            'Cuando siento dolor o malestar, intento sobreponerme y seguir adelante.',
            'Intento ignorar el dolor.',
            'Aparto las sensaciones de malestar concentrándome en otra cosa.',
            'Cuando siento sensaciones corporales desagradables, me ocupo de otra cosa para no tener que sentirlas.',
            'Cuando siento dolor físico, me altero.',
            'Si siento cualquier malestar, me empieza a preocupar que algo va mal.',
            'Puedo notar una sensación corporal desagradable sin preocuparme por ella.',
            'Puedo mantener la calma y no preocuparme cuando tengo sensaciones de malestar o dolor.',
            'Cuando siento malestar o dolor, no consigo quitármelo de la cabeza.',
            'Puedo prestar atención a mi respiración sin distraerme con lo que pasa a mi alrededor.',
            'Puedo mantener la conciencia de mis sensaciones corporales internas aunque haya muchas cosas sucediendo a mi alrededor.',
            'Cuando estoy conversando con alguien, puedo prestar atención a mi postura.',
            'Puedo volver a llevar la atención a mi cuerpo si estoy distraído.',
            'Puedo redirigir mi atención desde mis pensamientos a mis sensaciones corporales.',
            'Puedo mantener la conciencia de todo mi cuerpo incluso cuando una parte de mí siente dolor o malestar.',
            'Soy capaz de concentrarme conscientemente en mi cuerpo de manera global.',
            'Noto cómo cambia mi cuerpo cuando estoy enfadado.',
            'Cuando algo va mal en mi vida, puedo sentirlo en mi cuerpo.',
            'Noto que mi cuerpo se siente diferente después de una experiencia de calma.',
            'Noto que mi respiración se vuelve libre y fácil cuando me siento cómodo.',
            'Noto cómo cambia mi cuerpo cuando me siento contento o feliz.',
            'Cuando me siento sobrepasado, puedo encontrar un lugar tranquilo dentro de mí.',
            'Cuando dirijo la atención hacia mi cuerpo, siento calma.',
            'Puedo utilizar mi respiración para reducir la tensión.',
            'Cuando estoy atrapado en mis pensamientos, puedo calmar mi mente concentrándome en mi cuerpo o en mi respiración.',
            'Escucho la información que envía mi cuerpo sobre mi estado emocional.',
            'Cuando estoy alterado, me tomo el tiempo de explorar cómo se siente mi cuerpo.',
            'Escucho a mi cuerpo para saber qué hacer.',
            'En mi cuerpo, me siento en casa.',
            'Siento que mi cuerpo es un lugar seguro.',
            'Confío en mis sensaciones corporales.'
        ]
    },
    {
        id: 'CBI',
        nombre: 'CBI (Copenhagen Burnout Inventory)',
        descripcion: 'Mide el burnout en tres escalas: agotamiento personal (ítems 1-6), agotamiento relacionado con el trabajo (7-13) y agotamiento relacionado con el trato con usuarios (14-19). Los seis últimos ítems solo se responden si se trabaja con clientes o usuarios más de la mitad de la jornada.',
        version: '19 ítems · versión española validada (Molinero Ruiz et al., 2013)',
        etiquetas: ESCALA_CBI,
        textos: [
            '¿Con qué frecuencia te sientes cansado?',
            '¿Con qué frecuencia estás físicamente agotado?',
            '¿Con qué frecuencia estás psicológicamente agotado?',
            '¿Con qué frecuencia te sientes agotado?',
            '¿Con qué frecuencia te sientes débil y susceptible de enfermar?',
            '¿Con qué frecuencia piensas "no puedo más"?',
            '¿Te sientes agotado al final de tu jornada laboral?',
            '¿Por la mañana te agota pensar en otro día de trabajo?',
            '¿Sientes que cada hora de trabajo es agotadora?',
            '¿Tienes suficiente energía para la familia y los amigos durante el tiempo libre?',
            '¿Tu trabajo es emocionalmente agotador?',
            '¿Te sientes frustrado por tu trabajo?',
            '¿Te sientes quemado por tu trabajo?',
            '¿Es duro trabajar con clientes o usuarios?',
            '¿Trabajar con clientes o usuarios consume tu energía?',
            '¿Es frustrante trabajar con clientes o usuarios?',
            '¿Sientes que das más que recibes cuando trabajas con clientes o usuarios?',
            '¿Estás cansado de trabajar con clientes o usuarios?',
            '¿A veces te preguntas cuánto tiempo podrás continuar trabajando con clientes o usuarios?'
        ]
    }
];

export const buscarPredefinido = (id) => cuestionariosPredefinidos.find(c => c.id === id) || null;

export default cuestionariosPredefinidos;
