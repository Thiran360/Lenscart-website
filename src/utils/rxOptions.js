// Zenni Optical / Mr.LensMaker Standard Optical Prescription Options

export const generateSphOptions = () => {
  const options = [];
  // Negative SPH from -10.00 to -0.25
  for (let v = -10.0; v <= -0.25; v += 0.25) {
    const val = v.toFixed(2);
    options.push({ value: val, label: val });
  }
  // 0.00 Plano
  options.push({ value: "0.00", label: "0.00 (Plano)" });
  // Positive SPH from +0.25 to +10.00
  for (let v = 0.25; v <= 10.0; v += 0.25) {
    const val = "+" + v.toFixed(2);
    options.push({ value: val, label: val });
  }
  return options;
};

export const generateCylOptions = () => {
  const options = [{ value: "0.00", label: "0.00 (None)" }];
  // Negative CYL from -0.25 to -6.00
  for (let v = -0.25; v >= -6.0; v -= 0.25) {
    const val = v.toFixed(2);
    options.push({ value: val, label: val });
  }
  // Positive CYL from +0.25 to +6.00
  for (let v = 0.25; v <= 6.0; v += 0.25) {
    const val = "+" + v.toFixed(2);
    options.push({ value: val, label: val });
  }
  return options;
};

export const generateAxisOptions = () => {
  const options = [];
  for (let i = 1; i <= 180; i++) {
    options.push({ value: i.toString(), label: `${i}°` });
  }
  return options;
};

export const SPH_OPTIONS = generateSphOptions();
export const CYL_OPTIONS = generateCylOptions();
export const AXIS_OPTIONS = generateAxisOptions();
