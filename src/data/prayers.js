import prayersJson
  from './oracoes.json';


const sourcePrayers =
  Array.isArray(
    prayersJson?.oracoes
  )
    ? prayersJson.oracoes
    : [];


export const PRAYERS =
  sourcePrayers.map(
    (prayer, index) => ({
      id:
        prayer.slug ||
        String(index + 1),

      slug:
        prayer.slug || '',

      title:
        prayer.titulo ||
        'Oração sem título',

      description:
        prayer.categoria ||
        'Oração',

      category:
        prayer.categoria ||
        '',

      content:
        prayer.texto ||
        '',

      url:
        prayer.url ||
        '',
    })
  );


export function getPrayerById(
  prayerId
) {
  return PRAYERS.find(
    (prayer) =>
      String(prayer.id) ===
      String(prayerId)
  ) ?? null;
}