import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonStreamingComponent } from './json-streaming.component';

describe('JsonStreamingComponent', () => {
  let component: JsonStreamingComponent;
  let fixture: ComponentFixture<JsonStreamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsonStreamingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonStreamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
