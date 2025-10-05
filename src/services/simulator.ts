import { EventEmitter } from 'events';

// Sample NMEA data patterns
const NMEA_PATTERNS = {
  GGA: '$GPGGA,{time},{{lat}},{NS},{{lng}},{EW},1,08,1.0,{alt},M,0.0,M,,*{checksum}',
  RMC: '$GPRMC,{time},A,{{lat}},{NS},{{lng}},{EW},{speed},0.0,{date},,,A*{checksum}',
  VTG: '$GPVTG,0.0,T,0.0,M,{speed},N,{speedKm},K,A*{checksum}'
};

// Simulator class to generate NMEA sentences
export class NMEASimulator extends EventEmitter {
  private running: boolean = false;
  private interval: number = 1000; // ms between updates
  private timer: NodeJS.Timeout | null = null;
  private currentPosition: [number, number] = [0, 0]; // [lat, lng]
  private route: [number, number][] = [];
  private routeIndex: number = 0;
  private speed: number = 0;
  private altitude: number = 0;
  private customNmeaData: string[] = [];
  private useCustomData: boolean = false;

  constructor() {
    super();
  }

  // Start the simulator with default or custom route
  public start(options?: {
    interval?: number;
    startPosition?: [number, number];
    route?: [number, number][];
    nmeaData?: string[];
  }): void {
    if (this.running) return;

    if (options?.interval) {
      this.interval = options.interval;
    }

    if (options?.nmeaData && options.nmeaData.length > 0) {
      this.customNmeaData = options.nmeaData;
      this.useCustomData = true;
    } else {
      this.useCustomData = false;
      this.currentPosition = options?.startPosition || [40.7128, -74.0060]; // Default: NYC
      this.route = options?.route || this.generateCircularRoute(this.currentPosition, 0.01, 20);
      this.routeIndex = 0;
    }

    this.running = true;
    this.timer = setInterval(() => this.update(), this.interval);
  }

  // Stop the simulator
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
  }

  // Check if simulator is running
  public isRunning(): boolean {
    return this.running;
  }

  // Set simulator speed (updates per second)
  public setInterval(ms: number): void {
    this.interval = ms;
    if (this.running && this.timer) {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.update(), this.interval);
    }
  }

  // Load NMEA data from file content
  public loadNmeaFile(content: string): void {
    const lines = content.split(/\\r?\\n/).filter(line => 
      line.trim().startsWith('$') && 
      (line.includes('GGA') || line.includes('RMC') || line.includes('VTG'))
    );
    
    if (lines.length > 0) {
      this.customNmeaData = lines;
      this.useCustomData = true;
    }
  }

  // Generate a circular route around a center point
  private generateCircularRoute(
    center: [number, number], 
    radiusInDegrees: number, 
    points: number
  ): [number, number][] {
    const route: [number, number][] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const lat = center[0] + radiusInDegrees * Math.sin(angle);
      const lng = center[1] + radiusInDegrees * Math.cos(angle);
      route.push([lat, lng]);
    }
    
    return route;
  }

  // Update simulator state and emit NMEA data
  private update(): void {
    if (this.useCustomData) {
      // Use pre-loaded NMEA data
      if (this.customNmeaData.length > 0) {
        const line = this.customNmeaData[this.routeIndex % this.customNmeaData.length];
        this.emit('data', line);
        this.routeIndex++;
      }
    } else {
      // Generate synthetic NMEA data
      this.updatePosition();
      const sentences = this.generateNmeaSentences();
      sentences.forEach(sentence => {
        this.emit('data', sentence);
      });
    }
  }

  // Update current position based on route
  private updatePosition(): void {
    if (this.route.length === 0) return;
    
    this.currentPosition = this.route[this.routeIndex % this.route.length];
    this.routeIndex++;
    
    // Simulate some speed and altitude variations
    this.speed = 5 + Math.random() * 10; // 5-15 knots
    this.altitude = 100 + Math.sin(this.routeIndex / 10) * 20; // 80-120 meters
  }

  // Generate NMEA sentences based on current position
  private generateNmeaSentences(): string[] {
    const now = new Date();
    const time = now.toISOString().substring(11, 19).replace(/:/g, '');
    const date = now.toISOString().substring(2, 10).replace(/-/g, '');
    
    // Convert decimal lat/lng to NMEA format (DDMM.MMMM)
    const latDeg = Math.abs(Math.floor(this.currentPosition[0]));
    const latMin = (Math.abs(this.currentPosition[0]) - latDeg) * 60;
    const latNmea = latDeg * 100 + latMin;
    
    const lngDeg = Math.abs(Math.floor(this.currentPosition[1]));
    const lngMin = (Math.abs(this.currentPosition[1]) - lngDeg) * 60;
    const lngNmea = lngDeg * 100 + lngMin;
    
    const NS = this.currentPosition[0] >= 0 ? 'N' : 'S';
    const EW = this.currentPosition[1] >= 0 ? 'E' : 'W';
    
    // Replace placeholders in NMEA patterns
    const gga = NMEA_PATTERNS.GGA
      .replace('{time}', time)
      .replace('{{lat}}', latNmea.toFixed(4))
      .replace('{NS}', NS)
      .replace('{{lng}}', lngNmea.toFixed(4))
      .replace('{EW}', EW)
      .replace('{alt}', this.altitude.toFixed(1))
      .replace('{checksum}', '00'); // Simplified checksum
    
    const rmc = NMEA_PATTERNS.RMC
      .replace('{time}', time)
      .replace('{{lat}}', latNmea.toFixed(4))
      .replace('{NS}', NS)
      .replace('{{lng}}', lngNmea.toFixed(4))
      .replace('{EW}', EW)
      .replace('{speed}', this.speed.toFixed(1))
      .replace('{date}', date.substring(0, 6))
      .replace('{checksum}', '00');
    
    const vtg = NMEA_PATTERNS.VTG
      .replace('{speed}', this.speed.toFixed(1))
      .replace('{speedKm}', (this.speed * 1.852).toFixed(1))
      .replace('{checksum}', '00');
    
    return [gga, rmc, vtg];
  }
}

// Create and export a singleton instance
export const nmeaSimulator = new NMEASimulator();