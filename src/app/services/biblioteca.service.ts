import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Biblioteca } from "../interfaces/biblioteca.interface";
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
  export class BibliotecaService {

    baseUrl:string= environment.url;


    constructor(private http:HttpClient){}

    ngOninit(){}

    getBibliotecaLibros(titulo:string):Observable<Biblioteca>{

       const params = new HttpParams().set("title", titulo).set("limit", "10");

        return   this.http.get<Biblioteca>(`${this.baseUrl}`, {params:params});

    }

    getLibro(isbn:string):Observable<any>{

        const params = new HttpParams().set("isbn", isbn).set("limit", "10");

        return   this.http.get<Biblioteca>(`${this.baseUrl}`, {params:params});

   }


  }
