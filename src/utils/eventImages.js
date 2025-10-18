export const getEventImage = (eventName, eventType) => {
  const name = eventName?.toLowerCase() || '';
  const type = eventType?.toLowerCase() || '';

  if (name.includes('conference') || type.includes('conference')) {
    return 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (name.includes('workshop') || type.includes('workshop')) {
    return 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (name.includes('meeting') || type.includes('meeting')) {
    return 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (name.includes('seminar') || type.includes('seminar')) {
    return 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (name.includes('party') || name.includes('celebration') || type.includes('social')) {
    return 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (name.includes('training') || type.includes('training')) {
    return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (name.includes('launch') || type.includes('launch')) {
    return 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (name.includes('webinar') || type.includes('webinar')) {
    return 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800';
  }

  return 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800';
};

export const getEventTypeFromName = (name) => {
  const lowerName = name?.toLowerCase() || '';

  if (lowerName.includes('conference')) return 'conference';
  if (lowerName.includes('workshop')) return 'workshop';
  if (lowerName.includes('meeting')) return 'meeting';
  if (lowerName.includes('seminar')) return 'seminar';
  if (lowerName.includes('party') || lowerName.includes('celebration')) return 'social';
  if (lowerName.includes('training')) return 'training';
  if (lowerName.includes('launch')) return 'launch';
  if (lowerName.includes('webinar')) return 'webinar';

  return 'general';
};
