import { Customer, Offer } from '@/types';

const API_BASE = '/api';

// Advanced JSON sanitizer to handle corruption and malformed JSON responses
const sanitizeAndParseJSON = async (response: Response): Promise<any> => {
  try {
    const originalText = await response.text();
    
    // Log response size for debugging
    console.log(`Response size: ${originalText.length} characters`);
    
    // Use a mutable variable for the text we'll be modifying
    let processedText = originalText;
    
    // Check for known JSON structure issues
    if (processedText.includes('"customer":}')) {
      console.warn('Fixing customer reference issue');
      processedText = processedText.replace(/"customer":\}/g, '"customer":null}');
    }
    
    // Find valid JSON by looking for proper JSON structure
    // This handles cases where there might be extra characters after the JSON
    let sanitizedText = processedText;
    
    // Look for a complete JSON object or array
    const jsonMatch = processedText.match(/\{.*\}|\[.*\]/s);
    if (jsonMatch && jsonMatch[0] !== processedText) {
      console.warn('Found extra characters in JSON response, extracting valid JSON portion');
      sanitizedText = jsonMatch[0];
      
      // Log the problematic part
      if (processedText.length > sanitizedText.length) {
        const extraChars = processedText.substring(sanitizedText.length);
        console.error('Extra characters found after JSON:', extraChars.substring(0, 100));
      }
    }
    
    // If we have position information from the error, try to identify the issue
    if (processedText.length > 125818) {
      console.warn('Examining reported error position (125818)');
      console.log('Characters around position 125818:', JSON.stringify(processedText.substring(125810, 125830)));
    }
    
    try {
      return JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      
      // Specific handling for trailing characters
      if (parseError.message.includes('position')) {
        const posMatch = parseError.message.match(/position (\d+)/);
        if (posMatch) {
          const errorPos = parseInt(posMatch[1]);
          console.log(`Error at position ${errorPos}`);
          
          // Try truncating at the error position
          try {
            const truncated = sanitizedText.substring(0, errorPos);
            // Make sure it ends with a proper closing bracket
            const lastOpenBrace = truncated.lastIndexOf('{');
            const lastCloseBrace = truncated.lastIndexOf('}');
            
            if (lastOpenBrace > lastCloseBrace) {
              // Missing closing brace, add it
              return JSON.parse(truncated + '}');
            } else if (sanitizedText[errorPos] === '}' && truncated.endsWith(',')) {
              // Remove trailing comma and add closing brace
              return JSON.parse(truncated.substring(0, truncated.length - 1) + '}');
            } else {
              return JSON.parse(truncated);
            }
          } catch (e) {
            console.error('Failed to fix JSON by truncating:', e);
          }
        }
      }
      
      // Last resort: strip all non-JSON characters
      console.warn('Attempting aggressive JSON cleaning');
      try {
        // Replace any sequence that's not valid in JSON with a space
        const cleaned = sanitizedText.replace(/[^\x20-\x7E]+/g, ' ');
        return JSON.parse(cleaned);
      } catch (lastError) {
        console.error('All JSON repair attempts failed');
        throw new Error('Failed to parse server response: ' + parseError.message);
      }
    }
  } catch (error) {
    console.error('Error processing response:', error);
    throw error;
  }
};

// Data normalization to handle missing or invalid properties
const normalizeCustomer = (data: any): Customer | null => {
  if (!data) return null;
  
  // Basic structure with defaults
  return {
    id: data.id || null,
    name: data.name || '',
    pass: data.pass || '',
    contactDetails: data.contactDetails ? {
      id: data.contactDetails.id || null,
      email: data.contactDetails.email || '',
      phoneNo: data.contactDetails.phoneNo || '',
    } : { email: '', phoneNo: '' },
    kyc: data.kyc ? {
      id: data.kyc.id || null,
      dob: data.kyc.dob || '',
      adhaar: data.kyc.adhaar || '',
      pan: data.kyc.pan || '',
      address: data.kyc.address ? {
        id: data.kyc.address.id || null,
        line1: data.kyc.address.line1 || '',
        line2: data.kyc.address.line2 || '',
        street: data.kyc.address.street || '',
        city: data.kyc.address.city || '',
        state: data.kyc.address.state || '',
        country: data.kyc.address.country || '',
        zipcode: data.kyc.address.zipcode || '',
      } : {
        line1: '', line2: '', street: '', city: '', state: '', country: '', zipcode: ''
      }
    } : {
      dob: '', adhaar: '', pan: '', 
      address: { line1: '', line2: '', street: '', city: '', state: '', country: '', zipcode: '' }
    },
    accounts: Array.isArray(data.accounts) ? data.accounts.map((acc: any) => ({
      id: acc.id || null,
      number: acc.number || '',
      balance: typeof acc.balance === 'number' ? acc.balance : 0,
      type: acc.type || '',
      // Handle circular reference issue by only keeping the ID
      customer: acc.customer ? { id: acc.customer.id } : null
    })) : [],
    offers: Array.isArray(data.offers) ? data.offers : []
  };
};

// Normalize array of customers
const normalizeCustomersData = (customers: any[]): Customer[] => {
  if (!Array.isArray(customers)) return [];
  return customers.map(normalizeCustomer).filter((customer): customer is Customer => customer !== null);
};

// Offers API
export const fetchOffers = async (): Promise<Offer[]> => {
  const response = await fetch(`${API_BASE}/offers`);
  if (!response.ok) throw new Error('Failed to fetch offers');
  return response.json();
};

export const fetchActiveOffers = async (): Promise<Offer[]> => {
  const response = await fetch(`${API_BASE}/offers/active`);
  if (!response.ok) throw new Error('Failed to fetch active offers');
  return response.json();
};

export const fetchOfferById = async (id: number): Promise<Offer> => {
  const response = await fetch(`${API_BASE}/offers/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch offer with id ${id}`);
  return response.json();
};

export const createOffer = async (offer: Offer): Promise<Offer> => {
  const response = await fetch(`${API_BASE}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offer),
  });
  if (!response.ok) throw new Error('Failed to create offer');
  return response.json();
};

export const deleteOffer = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/offers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Failed to delete offer with id ${id}`);
};

export const assignOfferToCustomer = async (offerId: number, customerId: number): Promise<string> => {
  const response = await fetch(`${API_BASE}/offers/${offerId}/assign/${customerId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to assign offer to customer');
  return response.text();
};

export const removeOfferFromCustomer = async (offerId: number, customerId: number): Promise<string> => {
  const response = await fetch(`${API_BASE}/offers/${offerId}/remove/${customerId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove offer from customer');
  return response.text();
};

// Customers API
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    // Add cache busting and debugging headers
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/customers?t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    console.log('Parsing customers response...');
    const data = await sanitizeAndParseJSON(response);
    
    if (!Array.isArray(data)) {
      console.error('Expected array of customers but got:', typeof data);
      return [];
    }
    
    return data.map(normalizeCustomer).filter(Boolean);
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch customers');
  }
};

export const fetchCustomerById = async (id: number): Promise<Customer> => {
  try {
    // Add cache busting parameter
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/customers/${id}?t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch customer with id ${id}`);
    }
    
    const data = await sanitizeAndParseJSON(response);
    const customer = normalizeCustomer(data);
    if (!customer) {
      throw new Error(`Customer with id ${id} not found or data is invalid`);
    }
    return customer;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch customer with id ${id}`);
  }
};

export const createCustomer = async (customer: Customer): Promise<Customer> => {
  try {
    // Ensure customer has empty arrays where needed
    const preparedCustomer = {
      ...customer,
      accounts: customer.accounts || [],
      offers: customer.offers || []
    };
    
    console.log('Sending customer data:', JSON.stringify(preparedCustomer, null, 2));
    
    const response = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(preparedCustomer),
    });
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        errorMessage = `${response.status} - ${errorText || response.statusText}`;
      } catch (e) {
        errorMessage = `${response.status} - ${response.statusText}`;
      }
      throw new Error(`Failed to create customer: ${errorMessage}`);
    }
    
    const data = await sanitizeAndParseJSON(response);
    const normalizedCustomer = normalizeCustomer(data);
    if (!normalizedCustomer) {
      throw new Error('Failed to normalize customer data');
    }
    return normalizedCustomer;
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: number, customer: Customer): Promise<Customer> => {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!response.ok) throw new Error(`Failed to update customer with id ${id}`);
  return response.json();
};

export const deleteCustomer = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Failed to delete customer with id ${id}`);
};

export const getCustomerOffers = async (id: number): Promise<Offer[]> => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/customers/${id}/offers?t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch offers for customer with id ${id}`);
    }
    
    const data = await sanitizeAndParseJSON(response);
    
    if (!Array.isArray(data)) {
      console.warn('Expected array of offers but got:', typeof data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching offers for customer ${id}:`, error);
    throw new Error(`Failed to fetch offers for customer with id ${id}`);
  }
};
