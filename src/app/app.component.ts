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
  VWR: string[] = []; //VWR Variables Withouth Recursivity
  TWR: string[] = []; //TWR Terminales Withouth Recursivity
  objectVarProductions = [{ variable: "", production: "" }];
  objectVariableAndTerminales = [{ variable: "" as string, production: [] as string[] }];
  variableAndTerminalesSinRecursividad = [{ variable: "" as string, production: [[]] as string[][] }];
  variablesAndTerminalsWRecursivityShow = [{ variable: "" as string, production: "" as string }];
  fileDisplayText: string[] = [];

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
    this.objectVariableAndTerminales.forEach(production => {
      const order = production.production.sort((a, b) => a.length - b.length);
      const variable = production.variable + "!";
      order.forEach(prod => {
        const terminalsInProduction = prod.split("");
        if (production.variable === terminalsInProduction[0]) { //Si al evaluar es variable entra aqui
          const productionUnion = [];
          const productEpsilon = ["e"];
          const product = [];
          for (let i = 1; i < terminalsInProduction.length; i++) {
            product.push(terminalsInProduction[i]);
          }
          product.push(variable);
          productionUnion.push(product);
          productionUnion.push(productEpsilon);
          this.variableAndTerminalesSinRecursividad.push({ variable: variable, production: productionUnion });
          if (!this.VWR.includes(variable)){
            this.VWR.push(variable);
          }
        } else { //De lo contrario es una terminal
          if (!this.VWR.includes(production.variable)){
            this.VWR.push(production.variable);
          }
          const product = [];
          const index = this.variableAndTerminalesSinRecursividad.findIndex(li => li.variable === production.variable);
          if(index >= 0){
            this.variableAndTerminalesSinRecursividad[index].production.forEach(prd =>
              product.push(prd)
            );
            product.push(terminalsInProduction);
            this.variableAndTerminalesSinRecursividad[index].production = product;
          }else{
            product.push(terminalsInProduction);
            this.variableAndTerminalesSinRecursividad.push({ variable: production.variable, production: product });
          }
        }
      });
    });
    console.log('Despues', this.variableAndTerminalesSinRecursividad);
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

  separateVariablesAndProductions(array: string[]) {
    this.objectVariableAndTerminales = [];
    array.forEach(element => {
      const separate = element.split(":");
      if (separate[1].split("|").length > 1) {
        const prod = { variable: separate[0], production: separate[1].replaceAll("'", "").split("|") };
        this.objectVariableAndTerminales.push(prod);
      } else {
        const production = { variable: separate[0], production: separate[1].replaceAll("'", "").split("") };
        this.objectVariableAndTerminales.push(production);
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
    // this.variableAndTerminalesSinRecursividad.forEach(line => {
    //   if(!this.VWR.includes(line.variable)){
    //     this.VWR.push(line.variable);
    //   }
    // });
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
}
