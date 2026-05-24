import {
    stoOpCheck,
    stoOpGet,
    stoOpQueryStartWith,
    stoOpRem,
    stoOpSet,
} from './opStorage.js';

/**
 * eg:
 *
 * "domain ://abcdefg.com":{
 *   "keyAAA": "valueBBB"
 * }
 */
export class BaseORM {
  // Private class fields for encapsulation
  #keyPrefix = `domain `;
  #domainDefaultValue = {};

  // Private helper method to generate the prefix key
  #domainKey(k) {
    return `${this.#keyPrefix}${k}`;
  }

  /**
   * check domain exists, return true/false
   * @param {string} domain
   * @return {Promise<boolean>}
   */
  async #checkDomain(domain) {
    return await stoOpCheck(this.#domainKey(domain));
  }

  /**
   * @param {string} domain
   * @return {Promise<void>}
   */
  async #addDomain(domain) {
    await stoOpSet(this.#domainKey(domain), this.#domainDefaultValue);
  }

  /**
   * @param {string} domain
   * @return {Promise<void>}
   */
  async #removeDomain(domain) {
    await stoOpRem(this.#domainKey(domain));
  }

  /**
   * @param {string} domain
   * @param {*} valueNew
   * @return {Promise<void>}
   */
  async #updateDomain(domain, valueNew) {
    await stoOpSet(this.#domainKey(domain), valueNew);
  }

  /**
   * eg: ['a.com', 'b.com', 'c.com']
   * @returns {Promise<string[]>}
   */
  async getALLDomainKey() {
    // stoOpQueryByPrefix
    let strings = await stoOpQueryStartWith(this.#keyPrefix);
    return strings.map(v => v.replaceAll(this.#keyPrefix, ''));
  }

  /**
   * @returns {Promise<{domainList: string[], domainKeyValueMap: {}}>}
   */
  async getALLDomainMap() {
    let domainList = await this.getALLDomainKey();

    const domainKeyValueMap = {};
    for (let domain of domainList) {
      domainKeyValueMap[domain] = await this.getDomain(domain);
    }

    return {domainList, domainKeyValueMap};
  }

  /**
   * @param {string} domain
   * @returns {Promise<{}>}
   */
  async getDomain(domain) {
    if (!(await this.#checkDomain(domain))) {
      await this.#addDomain(domain);
    }
    return await stoOpGet(this.#domainKey(domain));
  }

  /**
   * {a:a1} => {a:a222}
   * @param {string} domain 'xxx.xxxxx.xxx'
   * @param {string} key
   * @param {string} valueToUpdate
   * @return {Promise<{}>}
   */
  async updateDomainValueByOneKeyValue(domain, key, valueToUpdate) {
    if (!(await this.#checkDomain(domain))) {
      await this.#addDomain(domain);
    }
    let domainValueGet = await this.getDomain(domain);
    domainValueGet[key] = valueToUpdate;
    await this.#updateDomain(domain, domainValueGet);
    return await this.getDomain(domain);
  }

  /**
   * @param {string} domain 'xxx.xxxxx.xxx'
   * @return {Promise<{}>}
   */
  async clearThisDomain(domain) {
    let domainValue = await this.getDomain(domain);
    await this.#removeDomain(domain);
    return domainValue;
  }
}
