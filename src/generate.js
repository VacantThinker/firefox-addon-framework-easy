import {stoOpGet, stoOpSet} from './opStorage.js';

/**
 * this function can use when you use serviceUserSettings.js
 *
 *
 * searchEngine: {
 *     optionType: 'checkbox',
 *     options: ['Searcher1', 'Searcher2'],
 *     selected: ['Searcher1', 'Searcher2'],
 *     queryTitle: {
 *       'Searcher1': 'https://y2down.cc/',
 *       'Searcher2': 'https://ssyou.online',
 *     },
 *   },
 *   videoQuality: {
 *     options: ['360', '480', '720', '1080', '1440', '2160'],
 *     selected: '720',
 *   },
 * @param userSettings{{}}
 * @param radioItemClickFn{function}
 * @returns {HTMLFieldSetElement[]}
 */
export function generateHtmlByUserSettings(
    userSettings,
    radioItemClickFn,
) {

  // todo generate html by data
  return Object.keys(userSettings).map(
      /**
       *
       * @param k{string}
       * @returns {HTMLFieldSetElement}
       */
      (k) => {
        /**
         * @type{{optionType:'checkbox'|'radio',options:[string], selected: string, }}
         */
        let v = userSettings[k];

        let optionType = v.optionType;
        if (optionType === undefined) {
          optionType = 'radio';
        }

        /**
         *
         * @type {string[]}
         */
        let options = v.options;
        // /**
        //  *
        //  * @type {string}
        //  */
        // let selected = v.selected;

        let eleWrap = document.createElement('fieldset');

        let eleTitle = document.createElement('legend');
        eleTitle.textContent = k;
        eleWrap.append(eleTitle);

        // console.info(`optionType=${optionType} options=${options}`)
        options.map(
            /**
             *
             * @param option{string}
             */
            option => {

              let eleLabel = document.createElement('label');
              eleLabel.textContent = option;

              let eleInput = document.createElement('input');
              eleInput.name = k;
              eleInput.type = optionType;
              eleInput.value = option;

              if (optionType === 'checkbox') {
                stoOpGet(k).then(
                    /**
                     *
                     * @param v{string}
                     */
                    v => {
                      let strings = Array.from(v);
                      console.info(`strings=${strings} option=${option}`);
                      const set = new Set(strings);
                      eleInput.checked = set.has(option);

                    });
              }
              else if (optionType === 'radio') {
                stoOpGet(k).then(
                    /**
                     *
                     * @param v{string}
                     */
                    v => {
                      if (option === v) {
                        eleInput.checked = true;
                      }
                    });
              }

              eleLabel.append(eleInput);

              if (optionType === 'checkbox') {
                eleInput.addEventListener('change', async () => {
                  let textCurrent = eleLabel.textContent;

                  let optionsCurrent = await stoOpGet(k);
                  console.info('optionsCurrent=', optionsCurrent);

                  let optionsArr = Array.from(optionsCurrent);
                  let set = new Set(optionsArr);
                  if (eleInput.checked) {
                    set.add(textCurrent);
                  }
                  else {
                    set.delete(textCurrent);
                  }

                  let valueNew = Array.from(set);
                  console.info(
                      `k=${k} text=${textCurrent} eleInput.checked=${eleInput.checked} valueNew=${valueNew}`);
                  await stoOpSet(k, valueNew);

                });
              }
              else if (optionType === 'radio') {
                eleLabel.onclick = function() {
                  stoOpSet(k, option).then(() => {
                    console.info(`k=${k} option=${option}`);
                    radioItemClickFn(k, option);
                  });
                };
              }
              return eleLabel;

            }).forEach(ele => eleWrap.append(ele));

        return eleWrap;
      });
}