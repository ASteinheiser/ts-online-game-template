export interface EntityPosition {
  x: number;
  y: number;
}

export interface EntitySize {
  width: number;
  height: number;
}

export interface Rectangle extends EntityPosition, EntitySize {}
