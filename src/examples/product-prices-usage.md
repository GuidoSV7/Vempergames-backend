# Uso de ProductPrices con Ofertas

## Estructura de la Base de Datos

La tabla `product_prices` ahora incluye:
- `name`: Nombre del tipo de precio (ej: "Precio Regular", "Oferta 30%")
- `value`: Valor base del precio
- `discountPercentage`: Porcentaje de descuento (0-100, nullable)
- `state`: Estado activo/inactivo (boolean)
- `productId`: ID del producto

## Ejemplos de Uso

### 1. Crear Precio Regular
```json
POST /product-prices
{
  "name": "Precio Regular",
  "value": 50.00,
  "productId": "uuid-del-producto"
}
```

### 2. Crear Oferta con 30% de Descuento
```json
POST /product-prices
{
  "name": "Oferta 30%",
  "value": 50.00,
  "discountPercentage": 30,
  "state": true,
  "productId": "uuid-del-producto"
}
```

### 3. Obtener Ofertas Activas de un Producto
```
GET /product-prices/product/{productId}/offers
```

### 4. Obtener Precio Regular de un Producto
```
GET /product-prices/product/{productId}/regular-price
```

### 5. Alternar Estado de un Precio
```
PATCH /product-prices/{id}/toggle-state
```

## Cálculo de Precio Final

```typescript
function calculateFinalPrice(price: ProductPrices): number {
  if (price.discountPercentage && price.discountPercentage > 0) {
    return price.value * (1 - price.discountPercentage / 100);
  }
  return price.value;
}

// Ejemplo:
// Precio base: $50.00
// Descuento: 30%
// Precio final: $50.00 * (1 - 30/100) = $35.00
```

## Casos de Uso

### Producto con Múltiples Ofertas
Un producto puede tener:
- 1 precio regular (discountPercentage = null)
- Múltiples ofertas activas (discountPercentage > 0)

### Control de Estado
- `state: true` = Precio activo y visible
- `state: false` = Precio inactivo y oculto

### Validaciones
- `discountPercentage` debe estar entre 0 y 100
- `value` debe ser positivo
- `state` es boolean con default true
