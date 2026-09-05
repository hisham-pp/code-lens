export interface RouteMetadata {
  type: 'api-route';
  framework: string;
  route: string;
  methods: string[];
  filePath: string;
}

export interface LayerMetadata {
  layer:
    | 'controller'
    | 'service'
    | 'repository'
    | 'model'
    | 'component'
    | 'hook'
    | 'middleware'
    | 'config'
    | 'util'
    | 'unknown';
  domain?: string;
  framework?: string;
}
