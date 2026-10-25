
/** Korean wing letters and their English names. */
export const WINGS = { 동: 'east', 서: 'west', 남: 'south', 북: 'north' };

/**
 * @typedef {Object} RoomCode
 * @property {string} buildingId
 * @property {string|null} wing     'east' | 'west' | 'south' | 'north' | null
 * @property {string|null} wingKo   동 | 서 | 남 | 북 | null
 * @property {string|null} room     e.g. "212", "231B", "B101"
 * @property {number|null} floor    1, 2, … (basement = -1)
 * @property {string|null} floorLabel e.g. "2F", "B1"
 * @property {string} raw
 */

/**
 * Prefix table from buildings: [{prefix, buildingId}], longest first.
 * @param {Array<{id: string, roomPrefixes?: string[]}>} buildings
 */
export function buildPrefixTable(buildings) {
  const table = [];
  for (const b of buildings) {
    for (const prefix of b.roomPrefixes ?? []) {
      table.push({ prefix: compact(prefix), buildingId: b.id });
    }
  }
  return table.sort((a, b) => b.prefix.length - a.prefix.length);
}

function compact(text) {
  return String(text).normalize('NFKC').replace(/\s+/g, '').toUpperCase();
}

/**
 * Floor from a room number: digits without the last two (B = basement).
 * @param {string} room
 * @returns {number|null}
 */
export function floorFromRoom(room) {
  if (!room) return null;
  const basement = /^B(\d)/i.exec(room);
  if (basement) return -Number(basement[1]);
  const digits = /^(\d+)/.exec(room)?.[1];
  if (!digits || digits.length < 3) return null;
  return Number(digits.slice(0, -2));
}

/**
 * Formats a floor number as "3F" or "B1".
 * @param {number|null} floor
 */
export function floorLabel(floor) {
  if (floor === null || floor === undefined || Number.isNaN(floor)) return null;
  return floor < 0 ? `B${-floor}` : `${floor}F`;
}

/**
 * Parses a room code.
 * @param {string} text  e.g. "2남 212호", "인하대학교 하이테크센터 801호"
 * @param {ReturnType<typeof buildPrefixTable>} prefixTable
 * @returns {RoomCode|null} null when no known building prefix is found.
 */
export function parseRoomCode(text, prefixTable) {
  if (!text) return null;
  const raw = String(text).trim();
  const input = compact(raw).replace(/^인하대학교/, '');

  const match = prefixTable.find(({ prefix }) => {
    if (!input.startsWith(prefix)) return false;
    // "6" must not match the start of "60주년": a numeric prefix may not be
    // followed by another digit.
    return !(/\d$/.test(prefix) && /^\d/.test(input.slice(prefix.length)));
  });
  if (!match) return null;

  let rest = input.slice(match.prefix.length).replace(/^호관/, '').replace(/^-/, '');
  // Wing: "남", "(남)", "북쪽", or a repeated building number "2남".
  let wingKo = null;
  const wing = /^\(?(\d*)(동|서|남|북)(쪽)?\)?/.exec(rest);
  if (wing) {
    wingKo = wing[2];
    rest = rest.slice(wing[0].length);
  }
  rest = rest.replace(/^-/, '');
  const floorMatch = /^(B?\d+)층/i.exec(rest);
  let floor = null;
  if (floorMatch) {
    floor = /^B/i.test(floorMatch[1]) ? -Number(floorMatch[1].slice(1)) : Number(floorMatch[1]);
    rest = rest.slice(floorMatch[0].length);
  }
  const roomMatch = /^(B?\d{1,4}[A-Z]?)호?/i.exec(rest);
  const room = roomMatch ? roomMatch[1].toUpperCase() : null;
  if (floor === null) floor = floorFromRoom(room);

  return {
    buildingId: match.buildingId,
    wing: wingKo ? WINGS[wingKo] : null,
    wingKo,
    room,
    floor,
    floorLabel: floorLabel(floor),
    raw,
  };
}
