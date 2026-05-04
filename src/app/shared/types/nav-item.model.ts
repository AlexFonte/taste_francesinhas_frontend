// Modelo de un item del navbar. enabled=false lo pinta deshabilitado (gris, sin click).
export interface NavItem {
  label:   string;
  icon:    string;
  route:   string;
  enabled: boolean;
}