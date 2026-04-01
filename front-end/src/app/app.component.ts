import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  public title = 'CountryWiki.Angular';

  constructor() {

  }

  public ngOnInit() {
  
  }
}