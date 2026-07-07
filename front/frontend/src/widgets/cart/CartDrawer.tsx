import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@store/useCartStore'
import { useAuthStore } from '@store/useAuthStore'
import styles from './CartDrawer.module.scss'

export default function CartDrawer() {
  const { carrito, isOpen, closeCart, actualizarItem, eliminarItem, fetchCarrito, getCarritoActivo } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) fetchCarrito()
  }, [isAuthenticated])

  const carritoActivo = getCarritoActivo(isAuthenticated)

  if (!isOpen) return null

  return (
    <>
      <div className={styles.backdrop} onClick={closeCart} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Carrito ({carrito?.cantidadItems ?? 0})</h2>
          <button onClick={closeCart} className={styles.closeButton}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {!carritoActivo || carritoActivo.items.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className={styles.emptyText}>Tu carrito está vacío</p>
              <Link to="/catalogo" onClick={closeCart} className={styles.emptyLink}>
                Explorar productos
              </Link>
            </div>
          ) : (
            carritoActivo.items.map(item => (
              <div key={item.id} className={styles.item}>
                <img
                  src={item.productoImagen || 'https://placehold.co/80x100/f3f4f6/9ca3af'}
                  alt={item.productoNombre}
                  className={styles.itemImage}
                />
                <div className={styles.itemBody}>
                  <p className={styles.itemName}>{item.productoNombre}</p>
                  {(item.talla || item.color) && (
                    <p className={styles.itemMeta}>
                      {item.talla && `Talla: ${item.talla}`}
                      {item.talla && item.color && ' · '}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  )}
                  <p className={styles.itemPrice}>${item.precio.toFixed(2)}</p>
                  <div className={styles.itemActions}>
                    <button
                      onClick={() => item.cantidad > 1 ? actualizarItem(item.id, item.cantidad - 1) : eliminarItem(item.id)}
                      className={styles.qtyButton}
                    >-</button>
                    <span className={styles.qtyValue}>{item.cantidad}</span>
                    <button
                      onClick={() => actualizarItem(item.id, item.cantidad + 1)}
                      className={styles.qtyButton}
                    >+</button>
                    <button onClick={() => eliminarItem(item.id)} className={styles.removeButton}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {carritoActivo && carritoActivo.items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>${carritoActivo.total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={closeCart} className="btn-primary block text-center w-full">
              Proceder al pago
            </Link>
            <Link to="/carrito" onClick={closeCart} className={styles.secondaryLink}>
              Ver carrito completo
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
