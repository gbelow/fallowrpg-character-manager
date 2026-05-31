
export function makeFullRoll(){
  let roll = Math.floor(Math.random() * 10)+1
    while(roll >= 10){
      const add = Math.floor(Math.random() * 6)+1
      roll +=add
      if(add != 6) break
    }
    while(roll <= 1){
      const sub = Math.floor(Math.random() * 6)+1
      roll -=sub
      if(sub != 6) break
    }
    return roll
}