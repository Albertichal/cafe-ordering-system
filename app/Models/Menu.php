<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'price',
        'image',
        'status',
    ];

    /**
     * Relationship: Menu has many OrderItems
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope: Get only ready/available menus
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'ready');
    }

    /**
     * Scope: Get menus by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}