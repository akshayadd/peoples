type People = {
  slug: string;
  firstName: string;
  lastName: string;
  dob: string;
};

export async function getPeople(): Promise<Array<People>> {
  return [
    {
      slug: "akshay-donga",
      firstName: "Akshay",
      lastName: "Donga",
      dob: 'asdsa'
    },
    {
      slug: "ankit-patel",
      firstName: "Ankit",
      lastName: "Patel",
      dob: 'asdsa'
    },
  ];
}