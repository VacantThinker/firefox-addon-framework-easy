import {BaseORM} from './BaseORM.js';

export class DomainORM extends BaseORM {
  constructor(domain) {
    super(`domainKey`, domain, {

    });
  }
  logKey(){
    console.info(this.id); // domainKey 123sdfsdf
  }
}