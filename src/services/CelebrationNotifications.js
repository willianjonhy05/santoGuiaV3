import {
  Platform,
} from 'react-native';

import * as Notifications
  from 'expo-notifications';


const CHANNEL_ID =
  'favorite-celebrations';

const MINUTES_BEFORE = 30;


const WEEKDAYS = {
  domingo: 1,
  segunda: 2,
  terca: 3,
  quarta: 4,
  quinta: 5,
  sexta: 6,
  sabado: 7,
};


/*
 * Faz a notificação aparecer mesmo
 * quando o aplicativo está aberto.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export async function
configureCelebrationNotifications() {
  /*
   * No Android 8+, notificações devem
   * utilizar um canal.
   */
  if (Platform.OS === 'android') {
    await Notifications
      .setNotificationChannelAsync(
        CHANNEL_ID,
        {
          name:
            'Celebrações favoritas',

          description:
            'Avisos das missas, confissões e adorações favoritas.',

          importance:
            Notifications
              .AndroidImportance.HIGH,

          sound: 'default',

          vibrationPattern: [
            0,
            250,
            250,
            250,
          ],
        }
      );
  }

  const currentPermission =
    await Notifications
      .getPermissionsAsync();

  if (currentPermission.granted) {
    return true;
  }

  if (
    currentPermission.canAskAgain ===
    false
  ) {
    return false;
  }

  const requestedPermission =
    await Notifications
      .requestPermissionsAsync();

  return requestedPermission.granted;
}


function getCelebrationChurch(
  celebration
) {
  return celebration?.igreja ?? {};
}


function getCategoryName(
  celebration
) {
  const category =
    celebration?.categoria;

  const names = {
    missa: 'Missa',
    missa_votiva: 'Missa votiva',
    confissao: 'Confissão',
    adoracao:
      'Adoração ao Santíssimo',
  };

  return (
    celebration?.categoria_display ||
    names[category] ||
    celebration?.nome ||
    'Celebração'
  );
}


function parseTime(timeString) {
  const match =
    /^(\d{2}):(\d{2})/.exec(
      timeString ?? ''
    );

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return {
    hour,
    minute,
  };
}


function parseCelebrationDate(
  celebration
) {
  const dateMatch =
    /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(
        celebration
          ?.proxima_data_iso ?? ''
      );

  const time =
    parseTime(
      celebration
        ?.horario_inicio
    );

  if (!dateMatch || !time) {
    return null;
  }

  const year =
    Number(dateMatch[1]);

  const month =
    Number(dateMatch[2]);

  const day =
    Number(dateMatch[3]);

  const date = new Date(
    year,
    month - 1,
    day,
    time.hour,
    time.minute,
    0,
    0
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  return date;
}


function subtractMinutesFromWeekday(
  weekday,
  hour,
  minute,
  minutesToSubtract
) {
  let totalMinutes =
    hour * 60 +
    minute -
    minutesToSubtract;

  let adjustedWeekday =
    weekday;

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;

    adjustedWeekday -= 1;

    if (adjustedWeekday < 1) {
      adjustedWeekday = 7;
    }
  }

  return {
    weekday: adjustedWeekday,
    hour: Math.floor(
      totalMinutes / 60
    ),
    minute:
      totalMinutes % 60,
  };
}


function buildNotificationContent(
  celebration,
  isLessThanThirtyMinutes = false
) {
  const church =
    getCelebrationChurch(
      celebration
    );

  const categoryName =
    getCategoryName(
      celebration
    );

  const churchName =
    church.nome ||
    'sua igreja favorita';

  const time =
    celebration
      .horario_inicio ||
    '';

  return {
    title:
      isLessThanThirtyMinutes
        ? 'Celebração próxima'
        : 'Faltam 30 minutos',

    body:
      `${categoryName} na ` +
      `${churchName} começa ` +
      `às ${time}.`,

    sound: 'default',

    data: {
      type:
        'favorite-celebration',

      celebrationId:
        String(
          celebration.id
        ),

      category:
        celebration.categoria,

      churchId:
        String(
          celebration.igreja_id ??
          church.id ??
          ''
        ),

      churchSlug:
        celebration.igreja_slug ||
        church.slug ||
        '',
    },
  };
}


/*
 * Celebrações semanais são agendadas
 * como notificações recorrentes.
 */
async function scheduleWeeklyReminder(
  celebration
) {
  const weekday =
    WEEKDAYS[
      celebration?.dia
    ];

  const time =
    parseTime(
      celebration
        ?.horario_inicio
    );

  if (!weekday || !time) {
    return null;
  }

  const reminderTime =
    subtractMinutesFromWeekday(
      weekday,
      time.hour,
      time.minute,
      MINUTES_BEFORE
    );

  const trigger = {
    type:
      Notifications
        .SchedulableTriggerInputTypes
        .WEEKLY,

    weekday:
      reminderTime.weekday,

    hour:
      reminderTime.hour,

    minute:
      reminderTime.minute,
  };

  if (Platform.OS === 'android') {
    trigger.channelId =
      CHANNEL_ID;
  }

  return Notifications
    .scheduleNotificationAsync({
      content:
        buildNotificationContent(
          celebration
        ),

      trigger,
    });
}


/*
 * Para data específica ou recorrências
 * mensais, agenda a próxima ocorrência.
 */
async function scheduleDateReminder(
  celebration
) {
  const celebrationDate =
    parseCelebrationDate(
      celebration
    );

  if (!celebrationDate) {
    return null;
  }

  const now = new Date();

  if (
    celebrationDate.getTime() <=
    now.getTime()
  ) {
    return null;
  }

  const reminderDate =
    new Date(
      celebrationDate.getTime() -
      MINUTES_BEFORE *
        60 *
        1000
    );

  const isLessThanThirtyMinutes =
    reminderDate.getTime() <=
    now.getTime();

  /*
   * Se faltarem menos de 30 minutos,
   * exibe o aviso praticamente agora.
   */
  const triggerDate =
    isLessThanThirtyMinutes
      ? new Date(
        now.getTime() + 2000
      )
      : reminderDate;

  const trigger = {
    type:
      Notifications
        .SchedulableTriggerInputTypes
        .DATE,

    date: triggerDate,
  };

  if (Platform.OS === 'android') {
    trigger.channelId =
      CHANNEL_ID;
  }

  return Notifications
    .scheduleNotificationAsync({
      content:
        buildNotificationContent(
          celebration,
          isLessThanThirtyMinutes
        ),

      trigger,
    });
}


export async function
scheduleCelebrationReminder(
  celebration
) {
  if (
    !celebration ||
    celebration.id === null ||
    celebration.id === undefined
  ) {
    return null;
  }

  const permissionGranted =
    await configureCelebrationNotifications();

  if (!permissionGranted) {
    return null;
  }

  /*
   * Missas e outras celebrações
   * semanais terão aviso toda semana.
   */
  if (
    celebration.recorrencia ===
    'semanal'
  ) {
    return scheduleWeeklyReminder(
      celebration
    );
  }

  /*
   * Celebrações mensais ou com data
   * específica recebem um aviso para
   * a próxima ocorrência conhecida.
   */
  return scheduleDateReminder(
    celebration
  );
}


export async function
cancelCelebrationReminder(
  notificationId
) {
  if (!notificationId) {
    return;
  }

  try {
    await Notifications
      .cancelScheduledNotificationAsync(
        notificationId
      );
  } catch (error) {
    console.warn(
      'Não foi possível cancelar a notificação:',
      error
    );
  }
}