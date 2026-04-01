import { Component, OnInit } from '@angular/core';
import { CountryModel } from '../models/countryModel';
import oboe from 'oboe';

@Component({
  selector: 'app-json-streaming',
  standalone: false,
  templateUrl: './json-streaming.component.html',
  styleUrls: ['./json-streaming.component.css']
})
export class JsonStreamingComponent implements OnInit {

  public countries: CountryModel[] = [];
  constructor() { }

  ngOnInit(): void {
    const config = {
      'url': "https://localhost:5001/stream/countries",
      'method': "GET",              
      'cached': false      
    }            
    const oboeService = oboe(config);
    oboeService.node('!.*', (country: CountryModel) => {            
      this.countries.push(country);
    });
  }
}