import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export function formatDate(d: Date) {
//   const pad = (n: number) => n.toString().padStart(2, "0");
//   let value = (  
//     d.getFullYear() +
//     "-" +
//     pad(d.getMonth() + 1) +
//     "-" +
//     pad(d.getDate()) +
//     "T" +
//     pad(d.getHours()) +
//     ":" +
//     pad(d.getMinutes())
//   );
//   return value;
// };

export function formatDate(value: any) {
  let d: Date = null;
  if (typeof value == "string" && value.includes('T')) {
    if (!value.includes("Z")) {
      d = new Date(value + "Z");
    } else {
      d = new Date(value);
    }
  } else {
    d = value;
  }
  const pad = (n: number) => n.toString().padStart(2, "0");
  let dateValue = (  
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
  return dateValue;
};

export function formatDateUTC(value: any) {
  let d: Date;
  if (typeof value === "string" && value.includes("T")) {
    d = new Date(value);
  } else {
    d = value;
  }

  // Convert to GMT-3 by subtracting 3 hours
  const offsetMs = 3 * 60 * 60 * 1000;
  const localDate = new Date(d.getTime() - offsetMs);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = localDate.getFullYear();
  const month = pad(localDate.getMonth() + 1);
  const day = pad(localDate.getDate());
  // + 3 para ficar UTC
  const hours = pad(localDate.getHours());
  const minutes = pad(localDate.getMinutes());


  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

// export function formatDateUTC(value: any) {
//   let d: Date;
//   if (typeof value === "string" && value.includes("T")) {
//     d = new Date(value);
//   } else {
//     d = value;
//   }

//   // Convert to GMT-3 by subtracting 3 hours
//   const offsetMs = 3 * 60 * 60 * 1000;
//   const localDate = new Date(d.getTime() - offsetMs);

//   const pad = (n: number) => n.toString().padStart(2, "0");

//   const year = localDate.getFullYear();
//   const month = pad(localDate.getMonth() + 1);
//   const day = pad(localDate.getDate());
//   // + 3 para ficar UTC
//   const hours = pad(localDate.getHours()+6);
//   const minutes = pad(localDate.getMinutes());


//   return `${year}-${month}-${day}T${hours}:${minutes}:00`;
// }

export function parseDate(value: string) {
  return new Date(value);
}

export function convertToCSV(jsonData) {
  if (!jsonData || jsonData.length === 0) {
    return "";
  }

  const headers = Object.keys(jsonData[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of jsonData) {
    const values = headers.map(header => {
      const value = row[header];
      // Basic handling for values containing commas or quotes
      const escapedValue = ('' + value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

export function toISOWithOffset(date: Date): string {
  const tzOffset = -date.getTimezoneOffset(); // in minutes
  const sign = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");

  const hours = pad(tzOffset / 60);
  const minutes = pad(tzOffset % 60);

  return date.toISOString().replace("Z", `${sign}${hours}:${minutes}`);
}

export function getTextColorForBackground(hex) {
  // Remove "#" if present
  hex = hex.replace(/^#/, '');

  // Expand shorthand form (#abc) to full form (#aabbcc)
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128 ? '#FFFFFF' : '#000000';
}


function hexToHSL(hex) {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function HSLToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c/2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  let red = Math.round((r + m) * 255).toString(16).padStart(2, "0");
  let green = Math.round((g + m) * 255).toString(16).padStart(2, "0");
  let blue = Math.round((b + m) * 255).toString(16).padStart(2, "0");

  return `#${red}${green}${blue}`;
}

export function generateVariations(hexBase) {
  const { h, s, l } = hexToHSL(hexBase);

  return {
    50: hexBase,                               // base
    200: HSLToHex(h, s, Math.max(l - 20, 0)), // um pouco mais escuro
    500: HSLToHex(h, s, Math.max(l - 45, 0)), // bem mais escuro
  };
}

export function generateVariation(hexBase, variation) {
  const { h, s, l } = hexToHSL(hexBase);
  let value = 0;
  if (variation == 200) {
    value = 20
  } else if (variation == 500) {
    value = 45;
  }
  return HSLToHex(h, s, Math.max(l - value, 0));
}