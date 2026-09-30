export type HelpBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'tip'; title?: string; text: string }
  | { type: 'offline'; text: string }
  | { type: 'online'; text: string }

export type HelpTopic = {
  slug: string
  title: string
  summary: string
  category: 'general' | 'modulos' | 'conexion' | 'referencia'
  categoryLabel: string
  blocks: HelpBlock[]
}

export const helpCategories: { id: HelpTopic['category']; label: string }[] = [
  { id: 'general', label: 'Primeros pasos' },
  { id: 'modulos', label: 'Módulos' },
  { id: 'conexion', label: 'Conexión y datos' },
  { id: 'referencia', label: 'Consulta rápida' },
]

export const helpTopics: HelpTopic[] = [
  {
    slug: 'bienvenida',
    title: 'Manual de usuario',
    summary: 'Qué es Justicia Cercana y para quién está pensada esta aplicación.',
    category: 'general',
    categoryLabel: 'Primeros pasos',
    blocks: [
      {
        type: 'p',
        text: 'Justicia Cercana es un prototipo para juezas y jueces de paz que trabajan en comunidades rurales. Está diseñado para usarse en una tableta de 10 pulgadas en horizontal, con textos claros y botones grandes.',
      },
      {
        type: 'h3',
        text: 'Qué puede hacer aquí',
      },
      {
        type: 'ul',
        items: [
          'Registrar y dar seguimiento a casos judiciales.',
          'Registrar actuaciones notariales.',
          'Consultar y programar actividades en la agenda (calendario).',
          'Trabajar sin Internet: los datos se guardan en la tableta y luego se sincronizan.',
        ],
      },
      {
        type: 'tip',
        title: 'Ayuda sin conexión',
        text: 'Todo este manual está dentro de la aplicación. No necesita Internet para leerlo, buscar temas ni imprimirlo.',
      },
    ],
  },
  {
    slug: 'inicio-pantalla',
    title: 'Pantalla de inicio',
    summary: 'Acciones principales, paneles del día y cómo moverse por la app.',
    category: 'general',
    categoryLabel: 'Primeros pasos',
    blocks: [
      {
        type: 'p',
        text: 'Al abrir la aplicación verá la fecha del día, tres acciones grandes (registrar caso, actuación notarial y ver agenda) y dos paneles: Para atender y Reuniones y actividades.',
      },
      {
        type: 'h3',
        text: 'Barra superior',
      },
      {
        type: 'ul',
        items: [
          'Toque Justicia Cercana para volver al inicio.',
          'El indicador verde o naranja muestra si hay conexión a Internet.',
          'Si hay cambios sin enviar, aparece un aviso morado con la opción Sincronizar.',
          'Ayuda abre el manual y la documentación (disponible siempre, con o sin red).',
        ],
      },
      {
        type: 'h3',
        text: 'Para atender',
      },
      {
        type: 'p',
        text: 'Lista casos con próxima atención vencida o actuaciones notariales pendientes. Toque un elemento para abrir su ficha.',
      },
    ],
  },
  {
    slug: 'casos-judiciales',
    title: 'Casos judiciales',
    summary: 'Registrar, consultar, editar y registrar avances en un caso.',
    category: 'modulos',
    categoryLabel: 'Módulos',
    blocks: [
      {
        type: 'p',
        text: 'Desde Inicio elija Registrar un caso o entre en Casos desde el flujo de navegación. Complete el asistente paso a paso; los campos obligatorios se indican claramente.',
      },
      {
        type: 'h3',
        text: 'Detalle del caso',
      },
      {
        type: 'ul',
        items: [
          'Tres columnas: datos del caso, personas y avances.',
          'Puede agregar personas y guardar cada panel por separado.',
          'Los avances registran lo ocurrido (audiencia, conciliación, etc.).',
        ],
      },
      {
        type: 'offline',
        text: 'Puede registrar y editar casos sin conexión. Los cambios quedan en la tableta hasta sincronizar.',
      },
    ],
  },
  {
    slug: 'actuaciones-notariales',
    title: 'Actuaciones notariales',
    summary: 'Solicitudes, personas involucradas y aviso de posible duplicado.',
    category: 'modulos',
    categoryLabel: 'Módulos',
    blocks: [
      {
        type: 'p',
        text: 'Use Registrar actuación notarial para constancias, certificaciones y trámites similares. El listado permite filtrar y abrir cada actuación.',
      },
      {
        type: 'h3',
        text: 'Duplicados',
      },
      {
        type: 'p',
        text: 'Si el sistema detecta una actuación muy parecida a otra ya registrada, mostrará un aviso para que confirme si desea continuar o revisar el registro existente.',
      },
      {
        type: 'offline',
        text: 'Las actuaciones nuevas o editadas se guardan localmente sin conexión.',
      },
    ],
  },
  {
    slug: 'agenda-calendario',
    title: 'Agenda y calendario',
    summary: 'Vista mes y día, nuevo evento, colores por estado y planilla horaria.',
    category: 'modulos',
    categoryLabel: 'Módulos',
    blocks: [
      {
        type: 'p',
        text: 'La agenda muestra sus actividades en vista Mes o Día. El botón + amarillo (abajo a la derecha) crea un evento nuevo.',
      },
      {
        type: 'h3',
        text: 'Formulario de evento',
      },
      {
        type: 'ul',
        items: [
          'Título, fecha (selector de calendario), hora de inicio y término.',
          'Opción Seleccionar en planilla: arrastre en la grilla para crear, mover o alargar el horario (similar a un calendario de escritorio).',
          'Lugar y comunidad, descripción y estado: programada (amarillo), realizada (verde), cancelada (rojo).',
        ],
      },
      {
        type: 'h3',
        text: 'Vista mes',
      },
      {
        type: 'p',
        text: 'Cada día con eventos muestra un círculo de colores: prioridad al amarillo (programada); verde y rojo se reparten el resto del círculo según cuántos eventos haya. Toque un día para ver el detalle en vista Día.',
      },
      {
        type: 'offline',
        text: 'La agenda completa funciona sin Internet; los eventos se guardan en la tableta.',
      },
    ],
  },
  {
    slug: 'sin-conexion',
    title: 'Trabajar sin conexión',
    summary: 'Qué funciona sin Internet y cómo se guardan los datos en la tableta.',
    category: 'conexion',
    categoryLabel: 'Conexión y datos',
    blocks: [
      {
        type: 'p',
        text: 'En zonas rurales la conexión puede fallar. La aplicación está pensada para seguir siendo útil sin red.',
      },
      {
        type: 'h3',
        text: 'Disponible sin conexión',
      },
      {
        type: 'ul',
        items: [
          'Consultar casos, actuaciones y agenda ya cargados en la tableta.',
          'Registrar y editar casos, actuaciones y eventos de agenda.',
          'Leer todo el manual de ayuda y documentación integrada.',
          'Imprimir o guardar en PDF una guía desde Ayuda.',
        ],
      },
      {
        type: 'h3',
        text: 'Requiere conexión',
      },
      {
        type: 'ul',
        items: [
          'Enviar cambios al sistema central (sincronización).',
          'Recibir actualizaciones del servidor (en un despliegue real).',
          'Abrir enlaces externos de soporte institucional (si los hubiera).',
        ],
      },
      {
        type: 'tip',
        title: 'Mensaje al guardar',
        text: 'Sin conexión verá “Guardado en esta tableta” y “Pendiente de sincronización”. Sus datos no se pierden al cerrar la aplicación.',
      },
      {
        type: 'offline',
        text: 'Los datos persisten en el almacenamiento local del navegador de esta tableta.',
      },
    ],
  },
  {
    slug: 'sincronizacion',
    title: 'Sincronizar datos',
    summary: 'Enviar cambios pendientes cuando vuelva Internet.',
    category: 'conexion',
    categoryLabel: 'Conexión y datos',
    blocks: [
      {
        type: 'p',
        text: 'Cuando haya conexión, use Sincronizar ahora desde el aviso morado de la barra superior o entre en la pantalla Sincronizar.',
      },
      {
        type: 'ol',
        items: [
          'Confirme que desea enviar los cambios guardados en la tableta.',
          'Espere a que termine el proceso; verá el progreso en pantalla.',
          'Si algo falla, los datos siguen en la tableta; puede reintentar más tarde.',
        ],
      },
      {
        type: 'online',
        text: 'La sincronización solo se completa con conexión activa.',
      },
      {
        type: 'tip',
        text: 'En demostración puede usar Simular conexión / Simular sin conexión en la barra superior para probar este flujo.',
      },
    ],
  },
  {
    slug: 'estados-colores',
    title: 'Estados y colores',
    summary: 'Significado de colores en agenda, avisos y conexión.',
    category: 'referencia',
    categoryLabel: 'Consulta rápida',
    blocks: [
      {
        type: 'ul',
        items: [
          'Verde (con conexión): hay Internet; puede sincronizar.',
          'Naranja (sin conexión): trabaje con normalidad; los guardados son locales.',
          'Morado: hay cambios pendientes de enviar al sistema.',
          'Amarillo opaco (agenda): actividad programada.',
          'Verde (agenda): actividad realizada.',
          'Rojo (agenda): actividad cancelada.',
        ],
      },
    ],
  },
  {
    slug: 'preguntas-frecuentes',
    title: 'Preguntas frecuentes',
    summary: 'Problemas comunes y qué hacer.',
    category: 'referencia',
    categoryLabel: 'Consulta rápida',
    blocks: [
      {
        type: 'h3',
        text: 'No veo un caso que registré',
      },
      {
        type: 'p',
        text: 'Revise el listado de Casos y los filtros. Si registró en otra tableta o navegador, solo aparecerá allí hasta sincronizar (en un entorno real con servidor).',
      },
      {
        type: 'h3',
        text: 'La página no cambia al navegar',
      },
      {
        type: 'p',
        text: 'Use los botones Volver o el enlace Justicia Cercana. Si el problema continúa, recargue la aplicación; los datos locales deberían mantenerse.',
      },
      {
        type: 'h3',
        text: '¿Puedo leer la ayuda sin Internet?',
      },
      {
        type: 'p',
        text: 'Sí. Entre en Ayuda desde la barra superior. También puede descargar el manual en HTML desde la misma pantalla para guardarlo en la tableta.',
      },
      {
        type: 'h3',
        text: '¿Cómo imprimo el manual?',
      },
      {
        type: 'p',
        text: 'Abra cualquier tema de ayuda y use Imprimir o guardar como PDF desde el botón de la página.',
      },
    ],
  },
]

export function getHelpTopic(slug: string): HelpTopic | undefined {
  return helpTopics.find((t) => t.slug === slug)
}
