import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Produccion{
  variable: string;
  productions: string[][];
}
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
  objectVariableAndProductions: Produccion[] = [];
  //producciones sin recursividad
  variableAndTerminalesSinRecursividad: Produccion[] = [];// [{ variable: "" as string, production: [[]] as string[][] }];
  //Variables y produccionese a mostrar en tabla sin recursividad
  variablesAndTerminalsWRecursivityShow = [{ variable: "" as string, production: "" as string }];
  //Arreglo de texto a mostrar sin recursividad.
  fileDisplayText: string[] = [];
  //Funcion primero
  functionFirstArray = [{ fp: "" as string, values: [] as string[] }];
  funcionPrimera: string[] = [];
  //Epsilon
  productionEpsilon = ["e"];

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
    this.funcionPrimeraArreglada();
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
      const productionOrder = line.productions.sort((a, b) => a.length - b.length);
      const variableFirst = line.variable + "!";
      const exist = this.existVariableOnProductions(line.variable, line.productions)

      if(!exist && line.productions.length === 1) {
        this.variableAndTerminalesSinRecursividad.push({ variable: line.variable, productions: line.productions });
        return;
      }
      productionOrder.forEach(production => {
        if(production[0] === line.variable){
          const productions: string[][] = [];
          const productionFirst = production.splice(1, production.length);
          productionFirst.push(variableFirst);
          productions.push(productionFirst);
          productions.push(this.productionEpsilon);
          this.variableAndTerminalesSinRecursividad.push({ variable: variableFirst, productions: productions });
        }
        else{
          const productions: string[][] = [];
          if(!exist && line.productions.length > 1){
            return;
          }
          production.push(variableFirst);
          productions.push(production);
          this.variableAndTerminalesSinRecursividad.push({ variable: line.variable, productions: productions });
        }
      });

      if(!exist && line.productions.length > 1){
        this.variableAndTerminalesSinRecursividad.push({ variable: line.variable, productions: line.productions });
      }
    });
    // console.log('Nuevo array', this.variableAndTerminalesSinRecursividad);
    this.variablesAndTerminalsWRecursivityShow = [];
    this.variableAndTerminalesSinRecursividad.forEach(line => {
      let productionString = "";
      line.productions.forEach(lineProd => {
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
        this.objectVariableAndProductions.push({ variable: separate[0], productions: arrayProductions});
      } else {
        let arrayProductions: string[][] = [[]];
        arrayProductions = [];
        arrayProductions.push(separate[1].replaceAll("'", "").split(""));
        this.objectVariableAndProductions.push({ variable: separate[0], productions: arrayProductions });
      }
    });
  }

  fileDisplay() {
    // console.log('display',this.variableAndTerminalesSinRecursividad);
    this.variableAndTerminalesSinRecursividad.forEach(line => {
      const productionsString: string[] = [];

      line.productions.forEach(element => {
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
      line.productions.forEach(production => {
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
    this.functionFirstArray = [];
    this.variableAndTerminalesSinRecursividad.forEach(production =>{
      const functionF = {fp: `P(${production.variable})`, values: [] as string[] };
      const index = this.variableAndTerminalesSinRecursividad.findIndex(p => p.variable === production.variable) + 1;
      const productions = production.productions;
      const moreThanOne = productions.length > 1;
      const productionsClone = Object.assign(this.variableAndTerminalesSinRecursividad);
      const terminal: string[] = [];
      if(moreThanOne){
        productions.forEach(prod => {
          console.log("evaluando si es variable", prod[0]);
          if(this.isVariable(prod[0])){
            const contador = this.ruleOneFunctionFirst(prod[0]);
            console.log("Retorna regla contador", contador);
            if(contador.length > 1){
              contador.forEach(produc => {
                terminal.push(produc);
              });
            }else{
              terminal.push(contador[0]);
            }
          }
          else if(this.isEpsilon(prod[0])){
            terminal.push(this.productionEpsilon[0]);
          }
          else if(this.isTerminal(prod[0])){
            terminal.push(prod[0]);
          }
        });
        functionF.values = terminal;
      }
      else{
        if(this.isVariable(productions[0][0])){
          // console.log("productions[0][0]", productions[0][0]);
          console.log("retorna regla", this.ruleOneFunctionFirst(productions[0][0]));
          terminal.push();
        }
        else if(this.isEpsilon(productions[0][0])){
          terminal.push(this.productionEpsilon[0]);
        }
        else if(this.isTerminal(productions[0][0])){
          terminal.push(productions[0][0]);
        }
      }
      this.functionFirstArray.push(functionF);
    });

    console.log("evaluando", this.functionFirstArray);
  }

  formarDatosFuncionPrimera(){
    const functionPrimera = [];
  }

  ruleOneFunctionFirst(variable: string){
    const index = this.variableAndTerminalesSinRecursividad.findIndex(production => production.variable === variable);
    if(index === this.variableAndTerminalesSinRecursividad.length - 1){
      return this.evaluaProduccionesTipoTerminal(this.variableAndTerminalesSinRecursividad[index].productions);
    }
    let terminales: string[] = [];

    if(this.variableAndTerminalesSinRecursividad[index].productions.length > 1){

      this.variableAndTerminalesSinRecursividad[index].productions.forEach(production => {
        const variableProduccion = production[0];
        if(this.isEpsilon(production[0])){

        } else {
          terminales = this.ruleOneFunctionFirst(variableProduccion);
        }
      });
    } else{
      if(this.isVariable(this.variableAndTerminalesSinRecursividad[index].productions[0][0])){
        const variableProduccion = this.variableAndTerminalesSinRecursividad[index].productions[0][0];
        terminales = this.ruleOneFunctionFirst(variableProduccion);
      }
    }
    return terminales.length > 0 ? terminales : [];
  }

  evaluaProduccionesTipoTerminal(producciones: string[][]){
    const terminales: string[] = [];
    producciones.forEach(produccion => {
      if(this.isVariable(produccion[0])){
        terminales.push(produccion[0]);
      }
    });
    return terminales.length === producciones.length ? terminales : [];
  }

  isVariable(value: string){
    return this.VWR.includes(value);
  }

  isTerminal(value: string){
    return this.TWR.includes(value);
  }

  isEpsilon(value: string){
    return this.productionEpsilon[0] === value;
  }

  funcionPrimeraArreglada(){
    this.functionFirstArray.forEach(func => {
      const fun = `${func.fp} {${func.values.join(',')}}`;
      this.funcionPrimera.push(fun);
    });
  }
}
