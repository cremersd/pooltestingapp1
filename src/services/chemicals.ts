import { TestReading, ChemicalRecommendation, PoolData, ChemicalTargets } from '../types';

export const getChemicalTargets = (poolType: string): ChemicalTargets => {
  const baseTargets = {
    freeChlorine: { min: 1.0, max: 3.0, ideal: 2.0, unit: 'ppm' },
    pH: { min: 7.2, max: 7.6, ideal: 7.4, unit: '' },
    totalAlkalinity: { min: 80, max: 120, ideal: 100, unit: 'ppm' },
    calciumHardness: { min: 150, max: 300, ideal: 225, unit: 'ppm' },
    cyanuricAcid: { min: 30, max: 50, ideal: 40, unit: 'ppm' },
    bromine: { min: 2.0, max: 4.0, ideal: 3.0, unit: 'ppm' },
    nitrates: { min: 0, max: 10, ideal: 0, unit: 'ppm' },
    phosphates: { min: 0, max: 100, ideal: 0, unit: 'ppb' }
  };

  if (poolType === 'saltwater') {
    baseTargets.freeChlorine = { min: 1.0, max: 3.0, ideal: 1.5, unit: 'ppm' };
  } else if (poolType === 'bromine') {
    baseTargets.freeChlorine = { min: 0, max: 0.5, ideal: 0, unit: 'ppm' };
  }

  return baseTargets;
};

export const calculateRecommendations = (
  results: TestReading,
  poolData: PoolData
): ChemicalRecommendation[] => {
  const recommendations: ChemicalRecommendation[] = [];
  const targets = getChemicalTargets(poolData.type);
  const { volume } = poolData;

  // Only process parameters that were actually detected on the test strip
  const detectedParams = results.detectedParameters || [];

  // Free Chlorine calculations (if detected)
  if (detectedParams.includes('Free Chlorine') && results.freeChlorine !== undefined) {
    if (results.freeChlorine < targets.freeChlorine.min) {
      const deficit = targets.freeChlorine.ideal - results.freeChlorine;
      const liquidChlorine = (deficit * volume * 0.00013).toFixed(2);
      
      recommendations.push({
        chemical: 'Liquid Chlorine (12.5% Sodium Hypochlorite)',
        action: 'increase',
        amount: parseFloat(liquidChlorine),
        unit: 'gallons',
        priority: deficit > 1.5 ? 'critical' : deficit > 0.8 ? 'high' : 'medium',
        reason: `Free chlorine at ${results.freeChlorine} ppm is below safe levels. Insufficient sanitization allows bacteria and algae growth.`,
        instructions: 'Add liquid chlorine gradually around pool perimeter while pump is running. Pour slowly to avoid localized high concentrations.',
        cost: parseFloat(liquidChlorine) * 4.50,
        timeToEffect: '2-4 hours',
        safetyNotes: 'Avoid swimming for at least 4 hours after addition. Ensure proper ventilation.',
        alternativeOptions: ['Calcium Hypochlorite (Cal-Hypo)', 'Trichlor tablets (slower acting)', 'Shock treatment if severely low']
      });
    } else if (results.freeChlorine > targets.freeChlorine.max) {
      recommendations.push({
        chemical: 'Time/Sunlight Exposure',
        action: 'decrease',
        amount: 0,
        unit: 'hours',
        priority: results.freeChlorine > 5 ? 'critical' : results.freeChlorine > 4 ? 'high' : 'medium',
        reason: `Free chlorine at ${results.freeChlorine} ppm is too high. Can cause skin/eye irritation and equipment damage.`,
        instructions: 'Stop adding chlorine immediately. Remove pool cover to allow UV degradation. Run pump continuously to circulate water.',
        cost: 0,
        timeToEffect: '6-24 hours',
        safetyNotes: 'Avoid swimming until levels drop below 3 ppm. Test every 2 hours.',
        alternativeOptions: ['Sodium thiosulfate for rapid reduction', 'Partial water replacement if extremely high']
      });
    }
  }

  // pH calculations (if detected)
  if (detectedParams.includes('pH') && results.pH !== undefined) {
    if (results.pH < targets.pH.min) {
      const deficit = targets.pH.ideal - results.pH;
      const sodaAsh = (deficit * volume * 0.0002).toFixed(1);
      
      recommendations.push({
        chemical: 'pH Increaser (Sodium Carbonate/Soda Ash)',
        action: 'increase',
        amount: parseFloat(sodaAsh),
        unit: 'lbs',
        priority: results.pH < 7.0 ? 'critical' : results.pH < 7.1 ? 'high' : 'medium',
        reason: `pH at ${results.pH} is too acidic. Low pH corrodes equipment, irritates skin/eyes, and reduces chlorine effectiveness.`,
        instructions: 'Pre-dissolve in bucket of pool water. Add slowly to deep end while pump runs. Wait 2 hours before retesting.',
        cost: parseFloat(sodaAsh) * 2.25,
        timeToEffect: '2-6 hours',
        safetyNotes: 'Wear gloves when handling. Avoid adding during peak sun hours.',
        alternativeOptions: ['Sodium bicarbonate (slower, gentler)', 'Borax (also raises alkalinity slightly)']
      });
    } else if (results.pH > targets.pH.max) {
      const excess = results.pH - targets.pH.ideal;
      const muriaticAcid = (excess * volume * 0.0003).toFixed(2);
      
      recommendations.push({
        chemical: 'pH Decreaser (Muriatic Acid)',
        action: 'decrease',
        amount: parseFloat(muriaticAcid),
        unit: 'quarts',
        priority: results.pH > 8.0 ? 'critical' : results.pH > 7.8 ? 'high' : 'medium',
        reason: `pH at ${results.pH} is too alkaline. High pH reduces chlorine effectiveness and can cause scaling on surfaces.`,
        instructions: 'CRITICAL: Add acid to water, NEVER water to acid. Pour slowly into deep end with pump running. Maintain distance from pool edge.',
        cost: parseFloat(muriaticAcid) * 3.75,
        timeToEffect: '1-4 hours',
        safetyNotes: 'Wear protective equipment. Ensure good ventilation. Keep acid away from metal surfaces.',
        alternativeOptions: ['Dry acid (sodium bisulfate) - safer handling', 'CO2 injection systems for frequent adjustment']
      });
    }
  }

  // Total Alkalinity calculations (if detected)
  if (detectedParams.includes('Total Alkalinity') && results.totalAlkalinity !== undefined) {
    if (results.totalAlkalinity < targets.totalAlkalinity.min) {
      const deficit = targets.totalAlkalinity.ideal - results.totalAlkalinity;
      const alkIncreaser = (deficit * volume * 0.000015).toFixed(1);
      
      recommendations.push({
        chemical: 'Alkalinity Increaser (Sodium Bicarbonate)',
        action: 'increase',
        amount: parseFloat(alkIncreaser),
        unit: 'lbs',
        priority: results.totalAlkalinity < 60 ? 'high' : 'medium',
        reason: `Total alkalinity at ${results.totalAlkalinity} ppm is too low. This causes pH instability and makes water balance difficult to maintain.`,
        instructions: 'Dissolve completely in bucket first. Add gradually over 2-3 days to avoid pH spike. Test daily during adjustment.',
        cost: parseFloat(alkIncreaser) * 3.50,
        timeToEffect: '6-24 hours per addition',
        safetyNotes: 'Add slowly to prevent cloudiness. Brush pool after addition to ensure mixing.',
        alternativeOptions: ['Baking soda (food grade sodium bicarbonate)', 'Alkalinity increaser with pH buffer']
      });
    } else if (results.totalAlkalinity > targets.totalAlkalinity.max) {
      recommendations.push({
        chemical: 'pH Decreaser (Muriatic Acid) - Gradual Method',
        action: 'decrease',
        amount: 0.25,
        unit: 'quarts per treatment',
        priority: results.totalAlkalinity > 150 ? 'medium' : 'low',
        reason: `Total alkalinity at ${results.totalAlkalinity} ppm is too high. This makes pH difficult to adjust and can cause scaling.`,
        instructions: 'Lower alkalinity gradually with multiple small acid additions over several days. Monitor pH closely and adjust as needed.',
        cost: 0.95,
        timeToEffect: '24-48 hours per treatment',
        safetyNotes: 'This is a slow process requiring patience. Rapid alkalinity reduction can cause pH to crash.',
        alternativeOptions: ['Aeration method (slower but chemical-free)', 'Partial water replacement']
      });
    }
  }

  // Calcium Hardness calculations (if detected)
  if (detectedParams.includes('Calcium Hardness') && results.calciumHardness !== undefined) {
    if (results.calciumHardness < targets.calciumHardness.min) {
      const deficit = targets.calciumHardness.ideal - results.calciumHardness;
      const calciumChloride = (deficit * volume * 0.00001).toFixed(1);
      
      recommendations.push({
        chemical: 'Calcium Chloride (Calcium Hardness Increaser)',
        action: 'increase',
        amount: parseFloat(calciumChloride),
        unit: 'lbs',
        priority: results.calciumHardness < 100 ? 'medium' : 'low',
        reason: `Calcium hardness at ${results.calciumHardness} ppm is too low. Soft water can etch plaster and corrode metal equipment.`,
        instructions: 'Pre-dissolve completely in bucket. Add slowly while pump runs. Brush pool surfaces to prevent localized high concentrations.',
        cost: parseFloat(calciumChloride) * 4.25,
        timeToEffect: '4-8 hours',
        safetyNotes: 'Ensure complete dissolution to prevent white residue. Add during cooler parts of day.',
        alternativeOptions: ['Calcium chloride dihydrate (more concentrated)', 'Gradual increase over multiple days']
      });
    } else if (results.calciumHardness > targets.calciumHardness.max) {
      const excessPercentage = Math.min(((results.calciumHardness - targets.calciumHardness.max) / targets.calciumHardness.max) * 100, 40);
      
      recommendations.push({
        chemical: 'Fresh Water (Partial Drain & Refill)',
        action: 'decrease',
        amount: Math.round(excessPercentage),
        unit: '% of pool water',
        priority: results.calciumHardness > 400 ? 'medium' : 'low',
        reason: `Calcium hardness at ${results.calciumHardness} ppm is too high. This can cause scaling on surfaces and equipment.`,
        instructions: 'Drain calculated percentage of pool water and refill with fresh water. Test source water hardness first.',
        cost: 0,
        timeToEffect: 'Immediate upon refill',
        safetyNotes: 'Check local water restrictions. Consider professional water testing for source water.',
        alternativeOptions: ['Calcium reducer chemicals (specialty products)', 'Reverse osmosis treatment', 'Sequestering agents to prevent scaling']
      });
    }
  }

  // Cyanuric Acid calculations (if detected)
  if (detectedParams.includes('Cyanuric Acid') && results.cyanuricAcid !== undefined) {
    if (results.cyanuricAcid < targets.cyanuricAcid.min) {
      const deficit = targets.cyanuricAcid.ideal - results.cyanuricAcid;
      const stabilizer = (deficit * volume * 0.000013).toFixed(1);
      
      recommendations.push({
        chemical: 'Cyanuric Acid (Pool Stabilizer/Conditioner)',
        action: 'increase',
        amount: parseFloat(stabilizer),
        unit: 'lbs',
        priority: poolData.location === 'outdoor' ? 'medium' : 'low',
        reason: `Cyanuric acid at ${results.cyanuricAcid} ppm is too low. Without stabilizer, chlorine degrades rapidly in sunlight.`,
        instructions: 'Add to skimmer basket with pump running, or pre-dissolve in bucket. May take 24-48 hours to fully dissolve and register.',
        cost: parseFloat(stabilizer) * 6.75,
        timeToEffect: '24-48 hours',
        safetyNotes: 'Undissolved stabilizer can temporarily cloud water. Be patient with dissolution process.',
        alternativeOptions: ['Stabilized chlorine tablets (gradual increase)', 'Liquid stabilizer (faster acting)']
      });
    } else if (results.cyanuricAcid > targets.cyanuricAcid.max) {
      const excessPercentage = Math.min(((results.cyanuricAcid - targets.cyanuricAcid.max) / targets.cyanuricAcid.max) * 100, 50);
      
      recommendations.push({
        chemical: 'Fresh Water (Partial Drain & Refill)',
        action: 'decrease',
        amount: Math.round(excessPercentage),
        unit: '% of pool water',
        priority: results.cyanuricAcid > 80 ? 'high' : results.cyanuricAcid > 60 ? 'medium' : 'low',
        reason: `Cyanuric acid at ${results.cyanuricAcid} ppm is too high. This reduces chlorine effectiveness and can lead to chlorine lock.`,
        instructions: 'Drain and refill calculated percentage. Cyanuric acid cannot be chemically reduced - only dilution works.',
        cost: 0,
        timeToEffect: 'Immediate upon refill',
        safetyNotes: 'High CYA requires higher chlorine levels. Consider switching to unstabilized chlorine temporarily.',
        alternativeOptions: ['Complete drain and refill (if extremely high)', 'Gradual water replacement over time']
      });
    }
  }

  // Bromine calculations (if detected)
  if (detectedParams.includes('Bromine') && results.bromine !== undefined) {
    if (results.bromine < targets.bromine.min) {
      const deficit = targets.bromine.ideal - results.bromine;
      const bromineTablets = (deficit * volume * 0.00008).toFixed(1);
      
      recommendations.push({
        chemical: 'Bromine Tablets or Granules',
        action: 'increase',
        amount: parseFloat(bromineTablets),
        unit: 'lbs',
        priority: deficit > 1.5 ? 'high' : 'medium',
        reason: `Bromine at ${results.bromine} ppm is below effective sanitization levels.`,
        instructions: 'Add bromine tablets to floating dispenser or use granular bromine dissolved in bucket. Maintain consistent levels.',
        cost: parseFloat(bromineTablets) * 8.50,
        timeToEffect: '2-6 hours',
        safetyNotes: 'Bromine is more stable at higher pH than chlorine. Ensure proper ventilation.',
        alternativeOptions: ['Sodium bromide + chlorine shock activation', 'Bromine granules for faster action']
      });
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};