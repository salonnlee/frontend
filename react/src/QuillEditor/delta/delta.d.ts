interface AttributeMap {
  [key: string]: any;
}

interface Op {
  insert?: string | object;
  delete?: number;
  retain?: number;

  attributes?: AttributeMap;
}
