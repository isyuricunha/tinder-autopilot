const onToggle =
  'display: flex; align-items: center; justify-content: center; border-radius: 20px; width: 56px; height: 32px; border: none; transition: all 0.3s ease; border: 2px solid #ff6b35; background: linear-gradient(135deg, #ff6b35, #ff8c42); box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3)';
const onToggleInner =
  'border-radius: 50%; background: #000000; border: 2px solid #ff6b35; width: 24px; height: 24px; transition: all 0.3s ease; transform: translateX(12px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)';

const offToggle =
  'display: flex; align-items: center; justify-content: center; border-radius: 20px; width: 56px; height: 32px; border: none; transition: all 0.3s ease; border: 2px solid #333333; background: #1a1a1a; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2)';
const offToggleInner =
  'border-radius: 50%; background: #000000; border: 2px solid #333333; width: 24px; height: 24px; transition: all 0.3s ease; transform: translateX(-12px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)';

module.exports = {
  onToggle,
  onToggleInner,
  offToggle,
  offToggleInner
};
