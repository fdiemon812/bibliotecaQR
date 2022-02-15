import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BibliotecaService } from '../services/biblioteca.service';

@Component({
  selector: 'app-libro',
  templateUrl: './libro.page.html',
  styleUrls: ['./libro.page.scss'],
})
export class LibroPage implements OnInit {


  isbn:string;
  titulo:string;
  year:string;
  editorial:string;
  img:string;
  autor:string[];

  constructor(private rutaActiva: ActivatedRoute, private libroService:BibliotecaService) { }

  ngOnInit( ) {


    this.isbn=this.rutaActiva.snapshot.params.isbn


    this.obtenerDatos();

  }



  obtenerDatos():void {

    this.libroService.getLibro(this.isbn).subscribe({

      next: resp=>{
        
        this.titulo=resp.docs[0].title;
        this.editorial=resp.docs[0]
        this.autor=resp.docs[0].author_name;
        this.editorial=resp.docs[0].publisher[0]
        this.year=resp.docs[0].first_publish_year
        this.img=resp.docs[0].isbn[2]
      },
      error:err=>{console.log(err)}
    


    })

  }

}
