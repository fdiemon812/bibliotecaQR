import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Libro } from '../interfaces/libro-interface';
import { BibliotecaService } from '../services/biblioteca.service';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.page.html',
  styleUrls: ['./biblioteca.page.scss'],
})
export class BibliotecaPage implements OnInit {

  isbn:string;
  libros:Array<Libro>;
  busqueda:string; 

  encodedData: any;
  scannedBarCode: {};
  barcodeScannerOptions: BarcodeScannerOptions;

  arrayLibro:Libro[]=[];


  private _storage: Storage | null = null;

  constructor(private storage:Storage, private bibliotecaService:BibliotecaService, public router:Router, private scan: BarcodeScanner) { }

  async ngOnInit() {

    await this.storage.create();
    this._storage = this.storage;
    this.storage.get('favs').then(response => {
      return response; // Devuelve una promesa
    })
    .then(data => {
      this.arrayLibro=data;
    })
  }


   public set(key: string, value: any) {
    this._storage?.set(key, value);}

  obtenerLibros():void{

    
     this.bibliotecaService.getBibliotecaLibros(this.busqueda).subscribe({
       
      next: resp=>{this.libros=resp.docs},
      error:err=>{console.log(err)}
    
    });
  }

  getLibro(isb){
    
    this.isbn=isb;
    console.log("isbn")
    this.router.navigate(["/libro", isb]);
  }


  scanBRcode() {
    this.scan.scan().then(res => {
        this.scannedBarCode = res;
        this.router.navigate(['/libro', res.text])
      }).catch(err => {
        alert(err);
      });
  }


  containsLibro(libro:Libro):number{

    let respuesta=-1;
    for (let index = 0; index < this.arrayLibro.length; index++) {
      
      const element = this.arrayLibro[index];
      
      if(element.isbn==libro.isbn){
        respuesta= index;
      }
    }

    return respuesta;



  }

  addFav(libro:Libro) {

    let posicion= this.containsLibro(libro);

   if(posicion==-1){

    this.arrayLibro.push(libro);
    console.log(this.arrayLibro)

   }else{

    this.arrayLibro.splice(posicion,1);
    console.log(this.arrayLibro)
   }
   this.storage.set('favs', this.arrayLibro)
   console.log(this.storage.get('favs'))

  }


 

  // compruebaFav(isbn){
  //   if(this.arrayIsbn.indexOf(isbn)==1){
  //     return true;
  //   }

  //   return false;
  // }

}
