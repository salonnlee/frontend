let Scope;

(function (Scope) {
  const TYPE = (1 << 2) - 1; // 0011 Lower two bits
  const LEVEL = ((1 << 2) - 1) << 2; // 1100 Higher two bits

  const ATTRIBUTE = (1 << 0) | LEVEL; // 1101
  const BLOT = (1 << 1) | LEVEL; // 1110
  const INLINE = (1 << 2) | TYPE; // 0111
  const BLOCK = (1 << 3) | TYPE; // 1011

  const BLOCK_BLOT = BLOCK & BLOT; // 1010
  const INLINE_BLOT = INLINE & BLOT; // 0110
  const BLOCK_ATTRIBUTE = BLOCK & ATTRIBUTE; // 1001
  const INLINE_ATTRIBUTE = INLINE & ATTRIBUTE; // 0101

  const ANY = TYPE | LEVEL;

  Scope[(Scope["TYPE"] = TYPE)] = "TYPE";
  Scope[(Scope["LEVEL"] = LEVEL)] = "LEVEL";

  Scope[(Scope["ATTRIBUTE"] = ATTRIBUTE)] = "ATTRIBUTE";
  Scope[(Scope["BLOT"] = BLOT)] = "BLOT";
  Scope[(Scope["INLINE"] = INLINE)] = "INLINE";
  Scope[(Scope["BLOCK"] = BLOCK)] = "BLOCK";

  Scope[(Scope["BLOCK_BLOT"] = BLOCK_BLOT)] = "BLOCK_BLOT";
  Scope[(Scope["INLINE_BLOT"] = INLINE_BLOT)] = "INLINE_BLOT";
  Scope[(Scope["BLOCK_ATTRIBUTE"] = BLOCK_ATTRIBUTE)] = "BLOCK_ATTRIBUTE";
  Scope[(Scope["INLINE_ATTRIBUTE"] = INLINE_ATTRIBUTE)] = "INLINE_ATTRIBUTE";

  Scope[(Scope["ANY"] = ANY)] = "ANY";
})(Scope || (Scope = {}));

export default Scope;
