import { Component, OnInit } from '@angular/core';
import { CountryModel } from '../models/countryModel';
import * as oboe from 'oboe';

@Component({
  selector: 'app-json-streaming',
  templateUrl: './json-streaming.component.html',
  styleUrls: ['./json-streaming.component.css']
})
export class JsonStreamingComponent implements OnInit {

  public countries: CountryModel[] = [];
  constructor() { }

  ngOnInit(): void {
    var config = {
      'url': "https://localhost:5001/stream/countries",
      'method': "GET",              
      'cached': false      
    }            
    const oboeService = oboe(config);
    var that = this;
    oboeService.node('!.*', function (country: CountryModel) {            
      that.countries.push(country);
    });
  }
}