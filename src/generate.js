import { stoOpGet, stoOpSet } from './opStorage.js';

/**
 * Generates HTML elements based on a user settings schema object.
 *
 * @param {Object} userSettings
 * @param {Function} radioItemClickCallback
 * @returns {HTMLFieldSetElement[]}
 */
export function generateHtmlByUserSettings(
    userSettings,
    radioItemClickCallback,
) {
  // Keeps track of all generated fieldsets by their storageKey
  const elementsMap = {};

  const fieldsets = Object.keys(userSettings).map((storageKey) => {
    const storageValue = userSettings[storageKey];
    const type = storageValue.type || 'text'; // Default to text if type is not specified

    // Common container wrapper for every configuration item
    const eleWrap = document.createElement('fieldset');
    const eleTitle = document.createElement('legend');
    eleTitle.textContent = storageKey;
    eleWrap.append(eleTitle);

    // Save a reference to the wrapper element for visibility switching
    elementsMap[storageKey] = eleWrap;

    // --- CONDITION 1: CHECKBOX & RADIO ---
    if (type === 'checkbox' || type === 'radio') {
      const options = storageValue.options || [];

      options.map((option) => {
        const eleLabel = document.createElement('label');
        eleLabel.textContent = option;

        const eleInput = document.createElement('input');
        eleInput.name = storageKey;
        eleInput.type = type;
        eleInput.value = option;

        if (type === 'checkbox') {
          stoOpGet(storageKey).then((v) => {
            const initialArray = Array.from(v || storageValue.selected || []);
            const set = new Set(initialArray);
            eleInput.checked = set.has(option);

            // Initial visibility evaluation
            triggerVisibility(storageKey, initialArray);
          });

          eleInput.addEventListener('change', async () => {
            const optionsCurrent = await stoOpGet(storageKey) || storageValue.selected || [];
            const set = new Set(Array.from(optionsCurrent));

            if (eleInput.checked) {
              set.add(option);
            } else {
              set.delete(option);
            }

            const valueNew = Array.from(set);
            console.info(`k=${storageKey} option=${option} eleInput.checked=${eleInput.checked} valueNew=${valueNew}`);
            await stoOpSet(storageKey, valueNew);

            // Dynamic visibility update
            triggerVisibility(storageKey, valueNew);
          });
        }
        else if (type === 'radio') {
          stoOpGet(storageKey).then((v) => {
            const currentSelected = (v !== undefined && v !== null) ? v : storageValue.selected;
            if (option === currentSelected) {
              eleInput.checked = true;
            }

            // Initial visibility evaluation
            triggerVisibility(storageKey, currentSelected);
          });

          eleLabel.onclick = function () {
            stoOpSet(storageKey, option).then(() => {
              console.info(`k=${storageKey} option=${option}`);
              if (typeof radioItemClickCallback === 'function') {
                radioItemClickCallback(storageKey, option);
              }

              // Dynamic visibility update
              triggerVisibility(storageKey, option);
            });
          };
        }

        eleLabel.append(eleInput);
        return eleLabel;
      }).forEach((ele) => eleWrap.append(ele));
    }

    // --- CONDITION 2: TOGGLE BUTTON ---
    else if (type === 'button') {
      const eleButton = document.createElement('button');
      eleButton.type = 'button'; // Prevent accidental form submissions

      stoOpGet(storageKey).then((v) => {
        // Fallback to default schema configuration if no value is stored yet
        let currentStatus = (v !== undefined && v !== null) ? (v === true || v === 'true') : storageValue.selected;
        eleButton.textContent = String(currentStatus);

        // Initial visibility evaluation
        triggerVisibility(storageKey, currentStatus);

        eleButton.addEventListener('click', async () => {
          currentStatus = !currentStatus; // Toggle state
          eleButton.textContent = String(currentStatus);
          console.info(`k=${storageKey} toggled to=${currentStatus}`);
          await stoOpSet(storageKey, currentStatus);

          // Dynamic visibility update
          triggerVisibility(storageKey, currentStatus);
        });
      });

      eleWrap.append(eleButton);
    }

    // --- CONDITION 3: NUMBER & TEXT INPUTS ---
    else if (type === 'number' || type === 'text') {
      const eleInput = document.createElement('input');
      eleInput.type = type;
      eleInput.name = storageKey;

      stoOpGet(storageKey).then((v) => {
        const currentVal = (v !== undefined && v !== null) ? v : storageValue.selected;
        eleInput.value = currentVal;

        // Initial visibility evaluation
        triggerVisibility(storageKey, currentVal);
      });

      // Updates storage on every keystroke/change execution
      eleInput.addEventListener('input', async () => {
        const rawValue = eleInput.value;
        const finalizedValue = type === 'number' ? Number(rawValue) : rawValue;

        console.info(`k=${storageKey} value changed to=${finalizedValue}`);
        await stoOpSet(storageKey, finalizedValue);

        // Dynamic visibility update
        triggerVisibility(storageKey, finalizedValue);
      });

      eleWrap.append(eleInput);
    }

    return eleWrap;
  });

  /**
   * Evaluates the visibility rules for a given source key based on its current value.
   */
  function triggerVisibility(sourceKey, currentValue) {
    const config = userSettings[sourceKey];
    if (config && config.visibilityControl) {
      const { targetField, expectedValue } = config.visibilityControl;
      const targetElement = elementsMap[targetField];

      if (targetElement) {
        // String conversion guarantees type safety (e.g., matching boolean true against string "true")
        const shouldBeVisible = String(currentValue) === String(expectedValue);
        targetElement.style.display = shouldBeVisible ? '' : 'none';
      }
    }
  }

  return fieldsets;
}