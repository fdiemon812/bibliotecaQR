import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
})
export class FavoritosPage implements OnInit {
  
  
  libros:any[]=[];
  private _storage: Storage | null = null;

  

  async ngOnInit() {

    await this.storage.create();

    this._storage = this.storage;
    // this.libros=this.storage.get('favs');
    this.storage.get('favs').then(response => {
      return response; // Devuelve una promesa
    })
    .then(data => {
      this.libros=data;
    })
  }

  
  constructor(private storage:Storage) { }



  transformarStorage(){

    

  }


  // this.titulo=resp.docs[0].title;
  // this.editorial=resp.docs[0]
  // this.autor=resp.docs[0].author_name;
  // this.editorial=resp.docs[0].publisher[0]
  // this.year=resp.docs[0].first_publish_year
  // this.img=resp.docs[0].isbn[2]




}
