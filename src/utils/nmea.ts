import { NMEAData, GPSPoint } from '../types/gps';

/**
 * Parse NMEA sentence into structured data
 * @param sentence NMEA sentence string
 * @returns Parsed NMEA data or null if invalid
 */
export function parseNMEA(sentence: string): NMEAData | null {
  // Basic validation
  if (!sentence.startsWith('$')) {
    return null;
  }

  // Remove checksum
  const parts = sentence.split('*');
  const data = parts[0];
  
  // Split into fields
  const fields = data.split(',');
  const type = fields[0].substring(1); // Remove $ prefix
  
  // Parse based on sentence type
  switch (type) {
    case 'GPGGA': // Global Positioning System Fix Data
      return parseGGA(fields, sentence);
    case 'GPRMC': // Recommended Minimum Specific GPS/Transit Data
      return parseRMC(fields, sentence);
    case 'GPVTG': // Track Made Good and Ground Speed
      return parseVTG(fields, sentence);
    default:
      return {
        type,
        data: {},
        raw: sentence
      };
  }
}

/**
 * Parse GGA sentence (position, altitude, satellites)
 */
function parseGGA(fields: string[], raw: string): NMEAData {
  return {
    type: 'GGA',
    data: {
      time: fields[1],
      latitude: parseLatitude(fields[2], fields[3]),
      longitude: parseLongitude(fields[4], fields[5]),
      quality: parseInt(fields[6] || '0'),
      satellites: parseInt(fields[7] || '0'),
      hdop: parseFloat(fields[8] || '0'),
      altitude: parseFloat(fields[9] || '0'),
      altitudeUnit: fields[10],
      geoidSeparation: parseFloat(fields[11] || '0'),
      geoidSeparationUnit: fields[12],
      dgpsAge: fields[13],
      dgpsStationId: fields[14]
    },
    raw
  };
}

/**
 * Parse RMC sentence (position, speed, course, date)
 */
function parseRMC(fields: string[], raw: string): NMEAData {
  return {
    type: 'RMC',
    data: {
      time: fields[1],
      status: fields[2],
      latitude: parseLatitude(fields[3], fields[4]),
      longitude: parseLongitude(fields[5], fields[6]),
      speed: parseFloat(fields[7] || '0') * 1.852, // Convert knots to km/h
      course: parseFloat(fields[8] || '0'),
      date: fields[9],
      magneticVariation: fields[10],
      magneticVariationDirection: fields[11],
      mode: fields[12]
    },
    raw
  };
}

/**
 * Parse VTG sentence (course, speed)
 */
function parseVTG(fields: string[], raw: string): NMEAData {
  return {
    type: 'VTG',
    data: {
      courseTrue: parseFloat(fields[1] || '0'),
      courseMagnetic: parseFloat(fields[3] || '0'),
      speedKnots: parseFloat(fields[5] || '0'),
      speedKmh: parseFloat(fields[7] || '0')
    },
    raw
  };
}

/**
 * Parse latitude from NMEA format (ddmm.mmm) to decimal degrees
 */
function parseLatitude(value: string, direction: string): number {
  if (!value) return 0;
  
  const degrees = parseInt(value.substring(0, 2));
  const minutes = parseFloat(value.substring(2));
  let result = degrees + (minutes / 60);
  
  if (direction === 'S') {
    result = -result;
  }
  
  return result;
}

/**
 * Parse longitude from NMEA format (dddmm.mmm) to decimal degrees
 */
function parseLongitude(value: string, direction: string): number {
  if (!value) return 0;
  
  const degrees = parseInt(value.substring(0, 3));
  const minutes = parseFloat(value.substring(3));
  let result = degrees + (minutes / 60);
  
  if (direction === 'W') {
    result = -result;
  }
  
  return result;
}

/**
 * Convert NMEA data to GPSPoint
 * @param data NMEA data object
 * @returns GPSPoint object
 */
export function nmeaToGpsPoint(data: NMEAData): GPSPoint | null {
  if (!data) return null;
  
  // Extract data based on sentence type
  switch (data.type) {
    case 'GGA': {
      const { latitude, longitude, altitude, satellites } = data.data;
      if (!latitude || !longitude) return null;
      
      return {
        latitude,
        longitude,
        altitude,
        satellites,
        timestamp: Date.now()
      };
    }
    case 'RMC': {
      const { latitude, longitude, speed, course, time, date } = data.data;
      if (!latitude || !longitude) return null;
      
      // Parse timestamp from NMEA date and time
      let timestamp = Date.now();
      if (date && time) {
        const day = parseInt(date.substring(0, 2));
        const month = parseInt(date.substring(2, 4)) - 1;
        const year = 2000 + parseInt(date.substring(4, 6));
        const hour = parseInt(time.substring(0, 2));
        const minute = parseInt(time.substring(2, 4));
        const second = parseInt(time.substring(4, 6));
        timestamp = new Date(year, month, day, hour, minute, second).getTime();
      }
      
      return {
        latitude,
        longitude,
        speed,
        heading: course,
        timestamp
      };
    }
    default:
      return null;
  }
}