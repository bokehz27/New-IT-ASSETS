// src/components/SpecialProgramsForm.js
import React, { useState, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import api from '../api';

const SpecialProgramsForm = ({ control, register }) => {
  const [programList, setProgramList] = useState([]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specialPrograms',
  });

  useEffect(() => {
    api.get('/special-programs').then(res => setProgramList(res.data));
  }, []);

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-center mb-2">
          <select {...register(`specialPrograms.${index}.program_id`)} className="flex-grow">
             <option value="">-- Select Program --</option>
             {programList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input
            {...register(`specialPrograms.${index}.license_key`)}
            placeholder="License Key"
            className="flex-grow w-full p-2 border rounded-md"
          />
          <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white px-3 py-2 rounded-md text-sm">Remove</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ program_id: '', license_key: '' })}
        className="bg-green-500 text-white px-3 py-2 rounded-md text-sm mt-2"
      >
        Add Program
      </button>
    </div>
  );
};

export default SpecialProgramsForm;