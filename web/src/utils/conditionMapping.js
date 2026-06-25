/**
 * EcoCycle - Condition Mapping Utility
 * Maps condition value (1-5) to actual percentage and label
 * Centralized mapping to ensure consistency across UI components
 */

export const CONDITION_MAP = {
  1: { percentage: 100, label: "Mới 100% (Chưa qua sử dụng, còn tag)", shortLabel: "Mới 100%" },
  2: { percentage: 99, label: "Mới 99% (Như mới, dùng thử 1-2 lần)", shortLabel: "Mới 99%" },
  3: { percentage: 95, label: "Mới 95% (Hao mòn cực ít, chất lượng tốt)", shortLabel: "Mới 95%" },
  4: { percentage: 80, label: "Cũ 80% (Hao mòn vừa phải, không lỗi rách)", shortLabel: "Cũ 80%" },
  5: { percentage: 60, label: "Cũ 60% (Cũ nhiều, giá rẻ)", shortLabel: "Cũ 60%" }
};

/**
 * Get percentage display from condition value
 * @param {number} conditionValue - Condition value (1-5) from backend
 * @returns {number} Actual percentage to display
 */
export function getConditionPercentage(conditionValue) {
  return CONDITION_MAP[conditionValue]?.percentage || 90;
}

/**
 * Get full label from condition value
 * @param {number} conditionValue - Condition value (1-5)
 * @returns {string} Human-readable label with description
 */
export function getConditionLabel(conditionValue) {
  return CONDITION_MAP[conditionValue]?.label || "Không xác định";
}

/**
 * Get short label from condition value
 * @param {number} conditionValue - Condition value (1-5)
 * @returns {string} Short label (e.g. "Mới 100%")
 */
export function getConditionShortLabel(conditionValue) {
  return CONDITION_MAP[conditionValue]?.shortLabel || "Chưa xác định";
}

/**
 * Validate if condition value is valid
 * @param {number} conditionValue - Condition value to validate
 * @returns {boolean} True if valid (1-5), false otherwise
 */
export function isValidCondition(conditionValue) {
  return conditionValue >= 1 && conditionValue <= 5;
}
