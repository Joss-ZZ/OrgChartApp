import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  splitID(termino: string): number {
    const idArr = termino.split('-');
    const id = Number(idArr[idArr.length-1]);
    return id;
  }

}
