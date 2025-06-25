import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface NavalActionItem {
  Name?: string
  ItemType?: string
  SortingGroup?: string
  ItemGroup?: string
  MaxStack?: number
  Gold?: number
  Labor?: number
  Requirements?: Record<string, unknown>
  Results?: Record<string, unknown>
  [key: string]: unknown
}

interface OrganizedItem {
  index: number
  name: string
  type?: string
  sortingGroup?: string
  itemGroup?: string
  maxStack?: number
  gold?: number
  labor?: number
  requirements?: Record<string, unknown>
  results?: Record<string, unknown>
  fullData: NavalActionItem
}

interface SubCategory {
  name: string
  count: number
  items: { index: number; name: string; fullData: NavalActionItem }[]
}

interface Category {
  name: string
  count: number
  subcategories: Record<string, SubCategory>
  items: OrganizedItem[]
}

interface OrganizedData {
  categories: Record<string, Category>
  totalItems: number
  items: NavalActionItem[]
}

export async function GET() {
  try {
    console.log('Reading and organizing Naval Action data from local file...')
    
    // Read the static JSON file from the public directory
    const filePath = path.join(process.cwd(), 'public', 'naval-action-data.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const rawData = JSON.parse(fileContents)
    
    console.log('Local data loaded, organizing...')
    
    // Convert to array if it's an object
    const itemsArray: NavalActionItem[] = Array.isArray(rawData) ? rawData : Object.values(rawData)
    
    // Organize data by categories and subcategories
    const organizedData: OrganizedData = {
      categories: {},
      totalItems: itemsArray.length,
      items: itemsArray
    }
    
    // Build category structure
    itemsArray.forEach((item, index) => {
      if (!item || typeof item !== 'object') return
      
      // Get primary category (ItemType, SortingGroup, or ItemGroup)
      const primaryCategory = item.ItemType || item.SortingGroup || item.ItemGroup || 'Uncategorized'
      
      if (!organizedData.categories[primaryCategory]) {
        organizedData.categories[primaryCategory] = {
          name: primaryCategory,
          count: 0,
          subcategories: {},
          items: []
        }
      }
      
      organizedData.categories[primaryCategory].count++
      organizedData.categories[primaryCategory].items.push({
        index,
        name: item.Name || 'Unnamed Item',
        type: item.ItemType,
        sortingGroup: item.SortingGroup,
        itemGroup: item.ItemGroup,
        maxStack: item.MaxStack,
        gold: item.Gold,
        labor: item.Labor,
        requirements: item.Requirements,
        results: item.Results,
        fullData: item
      })
      
      // Build subcategories
      const subCategory = item.SortingGroup || item.ItemGroup || 'General'
      if (subCategory !== primaryCategory) {
        if (!organizedData.categories[primaryCategory].subcategories[subCategory]) {
          organizedData.categories[primaryCategory].subcategories[subCategory] = {
            name: subCategory,
            count: 0,
            items: []
          }
        }
        organizedData.categories[primaryCategory].subcategories[subCategory].count++
        organizedData.categories[primaryCategory].subcategories[subCategory].items.push({
          index,
          name: item.Name || 'Unnamed Item',
          fullData: item
        })
      }
    })
    
    console.log(`Organized ${itemsArray.length} items into ${Object.keys(organizedData.categories).length} categories`)
    
    return NextResponse.json(organizedData, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error organizing Naval Action data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to organize Naval Action data', details: errorMessage },
      { status: 500 }
    )
  }
}
