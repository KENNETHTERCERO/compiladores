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
  //Array de texto a mostrar con recursividad.
  textArray: string[] = [];
  //Variables con recursividad
  V: string[] = [];
  // Terminales con recursividad
  T: string[] = [];
  //VWR Variables sin Recursividad
  VWR: string[] = [];
  //TWR Terminales sin Recursividad
  TWR: string[] = [];
  //variables y producciones con recursividad
  objectVarProductions = [{ variable: "", production: "" }];
  //variables y producciones normal
  objectVariableAndProductions = [{ variable: "" as string, production: [[]] as string[][] }];
  //producciones sin recursividad
  variableAndTerminalesSinRecursividad = [{ variable: "" as string, production: [[]] as string[][] }];
  //Variables y produccionese a mostrar en tabla sin recursividad
  variablesAndTerminalsWRecursivityShow = [{ variable: "" as string, production: "" as string }];
  //Arreglo de texto a mostrar sin recursividad.
  fileDisplayText: string[] = [];
  //Funcion primero
  functionFirstArray = [];

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
    this.VWR = [];
    this.TWR = [];
    this.fileDisplayText = [];
  }

  manageArray(array: string[]) {
    this.findVariables(array);
    this.findTerminales(array);
    this.findVariablesAndProductions(array);
    this.cleanRecursive(array);
    this.fileDisplay();
    this.findVariablesWithoutRecursity();
    this.findTerminalsWithoutRecursity();
    this.functionFirst();
  }

  findVariables(array: string[]) {
    array.forEach(element => {
      if (!this.V.includes(element.split(':')[0])) {
        this.V.push(element.split(':')[0]);
      }
    });
  }

  findTerminales(array: string[]) {
    array.forEach(element => {
      element.split(':')[1].split('|').forEach(line => {
        line.split('').forEach(position => {
          if (!this.V.includes(position)) {
            if (!this.T.includes(position)) {
              this.T.push(position);
            }
          }
        });
      });
    });
    this.T = this.T.map(terminal => terminal.replaceAll("'", ""));
  }

  findVariablesAndProductions(array: string[]) {
    this.objectVarProductions = [];
    array.forEach(element => {
      const separate = element.split(":");
      if (separate[1].split("|").length > 1) {
        separate[1].replaceAll("'", "").split("|").forEach(element => {
          this.objectVarProductions.push({ variable: separate[0], production: element });
        });
      }
      else {
        this.objectVarProductions.push({ variable: separate[0], production: separate[1].replaceAll("'", "") });
      }
    });
  }

  cleanRecursive(array: string[]) {
    this.variableAndTerminalesSinRecursividad = [];
    this.separateVariablesAndProductions(array);
    //console.log("Se dejan producciones como arrays. ", this.objectVariableAndProductions);
    this.objectVariableAndProductions.forEach(line => {
      const productionOrder = line.production.sort((a, b) => a.length - b.length);
      const productionEpsilon = ["e"];
      const variableFirst = line.variable + "!";
      const exist = this.existVariableOnProductions(line.variable, line.production)

      if(!exist && line.production.length === 1) {
        this.variableAndTerminalesSinRecursividad.push({ variable: line.variable, production: line.production });
        return;
      }
      productionOrder.forEach(production => {
        if(production[0] === line.variable){
          const productions: string[][] = [];
          const productionFirst = production.splice(1, 1);
          productionFirst.push(variableFirst);
          productions.push(productionFirst);
          productions.push(productionEpsilon);
          this.variableAndTerminalesSinRecursividad.push({ variable: variableFirst, production: productions });
        }
        else{
          const productions: string[][] = [];
          if(!exist && line.production.length > 1){
            return;
          }
          production.push(variableFirst);
          productions.push(production);
          this.variableAndTerminalesSinRecursividad.push({ variable: line.variable, production: productions });
        }
      });

      if(!exist && line.production.length > 1){
        this.variableAndTerminalesSinRecursividad.push({ variable: line.variable, production: line.production });
      }
    });
    // console.log('Nuevo array', this.variableAndTerminalesSinRecursividad);
    this.variablesAndTerminalsWRecursivityShow = [];
    this.variableAndTerminalesSinRecursividad.forEach(line => {
      let productionString = "";
      line.production.forEach(lineProd => {
        productionString = "";
        lineProd.forEach(lineProduction => {
          productionString += lineProduction;
        });
        this.variablesAndTerminalsWRecursivityShow.push({ variable: line.variable, production: productionString });
      });
    });
    // console.log(this.variableAndTerminalesSinRecursividad);
  }

  existVariableOnProductions(variable: string, production: string[][]){
    let exist = false;
    production.forEach(production => {
      if(variable === production[0]){
        exist = true;
      }
    });
    return exist;
  }

  separateVariablesAndProductions(array: string[]) {
    this.objectVariableAndProductions = [];
    array.forEach(element => {
      const separate = element.split(":");
      if (separate[1].split("|").length > 1) {
        const productions = separate[1].replaceAll("'", "").split("|");
        let arrayProductions: string[][] = [[]];
        arrayProductions = [];
        productions.forEach(production => arrayProductions.push(production.split("")));
        this.objectVariableAndProductions.push({ variable: separate[0], production: arrayProductions});
      } else {
        let arrayProductions: string[][] = [[]];
        arrayProductions = [];
        arrayProductions.push(separate[1].replaceAll("'", "").split(""));
        this.objectVariableAndProductions.push({ variable: separate[0], production: arrayProductions });
      }
    });
  }

  fileDisplay() {
    // console.log('display',this.variableAndTerminalesSinRecursividad);
    this.variableAndTerminalesSinRecursividad.forEach(line => {
      const productionsString: string[] = [];

      line.production.forEach(element => {
        let production = "";
        element.forEach(position => {
          production += position;
        });
        productionsString.push(production);
      });
      let productionString = line.variable + " : " + productionsString.join(" | ");
      this.fileDisplayText.push(productionString);
    });

  }

  findVariablesWithoutRecursity(){
    this.variableAndTerminalesSinRecursividad.forEach(line => {
      if(!this.VWR.includes(line.variable)){
        this.VWR.push(line.variable);
      }
    });
  }

  findTerminalsWithoutRecursity(){
    let epsilonExists: boolean = false;
    this.variableAndTerminalesSinRecursividad.forEach(line => {
      line.production.forEach(production => {
        production.forEach(position => {
          if(!this.VWR.includes(position) && !this.TWR.includes(position)){
            if(position === "e"){
              epsilonExists = true;
            }
            else{
              this.TWR.push(position);
            }
          }
        });
      });
    });
    if(epsilonExists){
      this.TWR.push("e");
    }
  }

  functionFirst(){
    // console.log("functionFirst", this.variableAndTerminalesSinRecursividad);
    //{fp: string, values: string[]}
    this.variableAndTerminalesSinRecursividad.forEach(production =>{
      const moreThanOne = production.production.length > 1;
      if(moreThanOne){
        production.production.forEach(production => {

        })
      }
    });
  }

  firstRuleFF(pruction: string[][]){

  }
}
