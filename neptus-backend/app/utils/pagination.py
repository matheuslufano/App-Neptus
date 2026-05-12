def paginate(query, page, per_page):
    if per_page > 50:
        per_page = 50
    if per_page < 1:
        per_page = 20
        
    total = query.count()
    pages = (total + per_page - 1) // per_page
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        'total': total,
        'pagina_atual': page,
        'itens_por_pagina': per_page,
        'total_paginas': pages,
        'items': items
    }
