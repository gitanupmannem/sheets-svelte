import { derived, get, writable, type Writable } from "svelte/store"

export function createSheet({ numOfRows, numOfColumns }: { numOfRows: number, numOfColumns: number }) {
  const sheet = new Map() // all cells stored in here

  for (let r = 0; r < numOfRows; r++) {
    for (let c = 0; c < numOfColumns; c++) {
      const columnName = getColumnName(c)
      const rowIndex = getRowIndex(r)
      const cell = createSheetCell({ row: r, column: c, sheet })
      // sheet.set('D6', cell);
      sheet.set(columnName + rowIndex, cell)
    }
  }
  return sheet;
}

export interface SheetCell {
  row: number,
  column: number,
  displayValue: Writable<string>,
  formula: Writable<string> & { startEditing: () => void, stopEditing: (save: boolean) => void }
}

// individual cell
function createSheetCell({ row, column, sheet }: { row: number, column: number, sheet: Map<string, SheetCell> }) {
  const displayValue = writable('')
  let formulaValue = '' // keeping a reference, before writing to store
  let lastSavedFormulaValue: string; // stores value returned from formula
  let cleanup: () => void;
  const formula = writable(formulaValue)

  return {
    row,
    column,
    displayValue,
    formula: {
      // ...formula, // get update, unsubscribe as well which are returned by writable
      set: (value: string) => {
        formulaValue = value; // intercept the value
        formula.set(value) // write to store
      },
      subscribe: formula.subscribe,
      startEditing() {
        // console.log(`Stop editing cell ${row}, ${column}`)
        // lastSavedFormulaValue = get(formula) // get value outputted by formula
        lastSavedFormulaValue = formulaValue;
      },
      stopEditing(save: boolean) {
        // console.log(`Stop editing cell ${row}, ${column}`)
        if (save) {
          if (formulaValue.startsWith('=')) {
            if (typeof cleanup === 'function') {
              cleanup()
            }
            // formula evaluation
            const derivedStore = createDerivedDisplayValueStore(formulaValue, sheet)
            cleanup = derivedStore.subscribe((newDisplayValue) => displayValue.set(newDisplayValue))
          } else {
            // normal cell value
            displayValue.set(formulaValue)
          }
        } else {
          formula.set(lastSavedFormulaValue) // set value, to type string
        }
      },
    }
  }
}

const formulaFunctions: any = {
  sum(a, b) {
    // E3- 10, E2- 11, =sum(E3, E2)
    return a + b
  }
}

function createDerivedDisplayValueStore(formulaValue: string, sheet: Map<string, SheetCell>) {
  const obj = new Proxy({}, {
    get(_, propertyName) {
      if (propertyName === Symbol.unscopables) return []
      if (propertyName in formulaFunctions) return formulaFunctions[propertyName]
      const displayValue = sheet.get(propertyName as string).displayValue
      if (detecting) {
        storesToSubscribe.push(displayValue)
      }
      // console.log(`reading ${propertyName as string}`, { propertyName })
      return get(displayValue)
    },
    has(_, key) {
      // console.log(`checking for`, key)
      return true
    }
  })
  // const obj = {
  //   E3: 123,
  // }
  // '= E3' => 123
  // 'with(obj) return E3'
  // (sheet) => { with(obj) { return E3 } }
  // reference: with - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with

  // 2 ways to create a function
  // const fn = new Function('a', 'b', 'return a+b')
  // const fn = (a, b) => {return a + b}        
  const fn = new Function('sheet', `with(sheet) { ${formulaValue.replace('=', 'return ')} }`)
  // console.log('---------------------------------')
  const storesToSubscribe = []; // storing each cell store in here
  let detecting = true;
  fn(obj)

  detecting = false;
  // console.log('stores -> ', storesToSubscribe)
  // console.log('---------------------------------')

  // derive from list of stores
  const derivedStore = derived(storesToSubscribe, () => {
    return fn(obj)
  })

  return derivedStore;
}
}

export function getColumnName(column: number) {
  return String.fromCharCode('A'.charCodeAt(0) + column)
}

export function getRowIndex(row: number) {
  return row + 1
}