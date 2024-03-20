import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  textArray: string[] = [];
  V: string[] = [];
  T: string[] = [];

  onDrop(e: any) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;
    this.reader(files[0], (err: any, res: any) => {
      this.cleanObjects();
      this.textArray = res.split(/\r?\n/);
      this.manageArray(this.textArray);
    })
  }

  allowDrop(ev: any) {
    ev.preventDefault();
  }

  reader(file: any, callback: any) {
    const fr = new FileReader();
    fr.onload = () => callback(null, fr.result);
    fr.onerror = (err) => callback(err);
    fr.readAsText(file);
  }

  cleanObjects() {
    this.textArray = [];
    this.V = [];
    this.T = [];
  }

  manageArray(array: string[]){
    this.findVariables(array);
    this.findTerminales(array);
  }

  findVariables(array: string[]){
    array.forEach(element => {
      if(!this.V.includes(element.split(':')[0])){
        this.V.push(element.split(':')[0]);
      }
    });
  }

  findTerminales(array: string[]){
    array.forEach(element => {
      const isUnique = element.split(':')[1].split('|').length > 1;
      if(!isUnique){
        if(!this.T.includes(element.split(':')[1])){
          const variables = element.split(':')[1].split('');
          let variableFound = false;
          variables.forEach(variable =>{
            if(this.V.includes(variable)){
              variableFound = true;
              return;
            }
          });
          if(!variableFound){
            this.T.push(element.split(':')[1]);
          }
        }
      }
      if(isUnique){
        const terminales = element.split(':')[1].split('|');
        terminales.forEach(terminal => {
          const variables = terminal.split('');
          let variableFound = false;
          variables.forEach(variable =>{
            if(this.V.includes(variable)){
              variableFound = true;
              return;
            }
          });
          if(variableFound){
            return;
          }
          if(!this.T.includes(terminal)){
            this.T.push(terminal);
          }
        });
      }
    });
  }

}
