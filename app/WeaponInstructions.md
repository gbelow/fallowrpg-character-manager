I have  a model of a weapon. I need you to take a list of latex entries and translate them into the model format.

"ShortSword": {
  "name": "ShortSword",
  "handed": "one",
  "penalty": 0,
  "scale": 3,
  "attacks": [
    {
      "type": "melee",
      "energy": 8,
      "forceMod": 1,
      "STRmod": 0,
      "heavyMod": 0,
      "SHP": 2,
      "range": "short",
      "RES": 50,
      "RESmod": 0,
      "AP": 3,
      "reload": 0,
      "deflection": 0,
      "properties": "precise, draw",
      "handed": "one"
     },
  ]
}


penalty is a positive number.
scale is always 3.
AP for melee weapons is always 3. For ranged ones it is explicit in the book. if they are a string, put the first value as ap and the second as reload, otherwise reload is 0.
deflection is always 0.
heavyMod is 0.5 when property heavy I is present, 1 when heavy 2 and 1.5 when heavy 3.
StrMod exists when energy is STR or a multiple of it. When that happens, energy is 0 and StrMod is the multiple.
ForceMod is 1, except when the weapon has soft property, then its 2. when it is fast it is 0.5.