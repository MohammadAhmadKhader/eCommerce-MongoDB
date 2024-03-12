export function isJSON(str : string) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  